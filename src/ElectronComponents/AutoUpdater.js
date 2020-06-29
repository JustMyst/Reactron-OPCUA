"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_updater_1 = require("electron-updater");
const log = __importStar(require("electron-log"));
const Message_1 = require("./Message");
const Config_1 = require("./Config");
const electron_1 = require("electron");
const electron_2 = require("../../public/electron");
class Updater {
    constructor() {
        // Logging
        electron_updater_1.autoUpdater.logger = log;
        electron_updater_1.autoUpdater.logger.transports.file.level = "info";
        electron_updater_1.autoUpdater.setFeedURL(Config_1.config.autoUpdater.updateServerUrl);
        electron_updater_1.autoUpdater.autoInstallOnAppQuit = true;
        this.attachEvents();
        this.checkForUpdates();
        if (Config_1.config.autoUpdater.frequencyH > 0)
            setInterval(() => {
                this.checkForUpdates();
            }, 1000 * 60 * 60 * Config_1.config.autoUpdater.frequencyH);
    }
    ;
    checkForUpdates() {
        electron_updater_1.autoUpdater.checkForUpdates();
    }
    attachEvents() {
        electron_updater_1.autoUpdater.on("checking-for-update", () => sendStatus("DualView Updater:\nChecking for updates..."));
        electron_updater_1.autoUpdater.on("update-available", (ev) => sendStatus(`DualView Updater:\nNew version available: ${ev.version}\nStarting download.`));
        electron_updater_1.autoUpdater.on("update-not-available", (ev, info) => sendStatus("DualView Updater:\nUpdate not available."));
        electron_updater_1.autoUpdater.on("error", (ev, err) => sendStatus(`DualView Updater:\nError during auto update: ${ev.message}`, "error"));
        electron_updater_1.autoUpdater.on("update-downloaded", async (ev, info) => {
            if (Config_1.config.autoUpdater.installAction === "prompt") {
                const updaterDialog = await electron_1.dialog.showMessageBox(electron_2.mainWindow, {
                    title: "DualView Updater",
                    message: "Update Downloaded.\nInstall now?",
                    type: "question",
                    buttons: ["Yes", "No"]
                });
                if (updaterDialog.response === 0)
                    electron_updater_1.autoUpdater.quitAndInstall(false);
            }
            ;
            sendStatus("DualView Updater:\nUpdate downloaded and will be installed on app close.");
        });
    }
    ;
}
exports.Updater = Updater;
function sendStatus(text, type = "info") {
    type === "info" ? log.info(text) : log.error(text);
    Message_1.showNotification(type, "AutoUpdater", text);
}
//# sourceMappingURL=AutoUpdater.js.map