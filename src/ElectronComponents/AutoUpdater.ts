import { autoUpdater, UpdateInfo } from "electron-updater";
import * as log from "electron-log";
import { showNotification } from "./Message";
import { config } from "./Config";
import { dialog } from "electron";
import { mainWindow } from "../../public/electron";

export class Updater {

    constructor() {
        // Logging
        autoUpdater.logger = log;
        (<log.ElectronLog>autoUpdater.logger).transports.file.level = "info";

        autoUpdater.setFeedURL(config.autoUpdater.updateServerUrl);
        autoUpdater.autoInstallOnAppQuit = true;

        this.attachEvents();

        this.checkForUpdates();

        if (config.autoUpdater.frequencyH > 0)
            setInterval(() => {
                this.checkForUpdates();
            }, 1000 * 60 * 60 * config.autoUpdater.frequencyH);
    };

    checkForUpdates() {
        autoUpdater.checkForUpdates();
    }

    attachEvents() {
        autoUpdater.on("checking-for-update", () => sendStatus("DualView Updater:\nChecking for updates..."));

        autoUpdater.on("update-available", (ev: UpdateInfo) => sendStatus(`DualView Updater:\nNew version available: ${ev.version}\nStarting download.`));

        autoUpdater.on("update-not-available", (ev, info) => sendStatus("DualView Updater:\nUpdate not available."));

        autoUpdater.on("error", (ev, err) => sendStatus(`DualView Updater:\nError during auto update: ${ev.message}`, "error"));

        autoUpdater.on("update-downloaded", async (ev, info) => {
            if (config.autoUpdater.installAction === "prompt") {
                const updaterDialog = await dialog.showMessageBox(mainWindow, {
                    title: "DualView Updater",
                    message: "Update Downloaded.\nInstall now?",
                    type: "question",
                    buttons: ["Yes", "No"]
                });

                if (updaterDialog.response === 0)
                    autoUpdater.quitAndInstall(false);
            };

            sendStatus("DualView Updater:\nUpdate downloaded and will be installed on app close.");
        });
    };
}

function sendStatus(text: string, type: "info" | "error" = "info") {
    type === "info" ? log.info(text) : log.error(text);
    showNotification(type, "AutoUpdater", text);
}
