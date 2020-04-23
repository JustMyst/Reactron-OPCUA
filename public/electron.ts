import { app, BrowserWindow, ipcMain, WebContents, globalShortcut, Menu } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as isDev from "electron-is-dev";
import { OpcuaClient } from "../src/ElectronComponents/OPC UA/Client/MainClient"
import { config } from "../src/ElectronComponents/Config";
import { Updater } from "../src/ElectronComponents/AutoUpdater";
import { initCommunication } from "../src/ElectronComponents/Message";


// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
export let
    mainWindow: BrowserWindow,
    configWindow: BrowserWindow,
    autoUpdater: Updater

export const webviews: (WebContents & { name: string })[] = [];

export const initPath = path.join(app.getPath("userData"), "init.json");

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", async () => {

    if (process.platform === "win32") {
        app.setAppUserModelId("com.kamilchowaniec.reactron");
    }


    mainWindow = new BrowserWindow({
        show: false,
        width: config.display.width,
        height: config.display.height,
        minWidth: 900,
        minHeight: 600,
        icon: "./favicon.ico",
        backgroundColor: "#fff",
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    });
    mainWindow.setTitle("reactron");

    createMenu();

    // Load latest window location
    loadWindowLocation();

    // Load Main HTML file
    mainWindow.loadURL(isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`);

    mainWindow.once("ready-to-show", async () => {
        // Show window when loaded
        mainWindow.show();

        initCommunication();

        // Initiate AutoUpdater if config has required data
        if (config.autoUpdater?.updateServerUrl)
            autoUpdater = new Updater();
    });
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    saveWindowLocation();
    app.quit();
});

process.on("uncaughtException", (err) => {

});

export function openConfig() {
    configWindow = new BrowserWindow({
        show: false,
        width: 300,
        height: 400,
        minWidth: 300,
        minHeight: 400,
        icon: "./favicon.ico",
        backgroundColor: "#fff",
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    });

    configWindow.loadURL(isDev
        ? "http://localhost:3000/#/config"
        : `file://${path.join(__dirname, "../build/index.html/#/config")}`);

    configWindow.removeMenu();

    configWindow.once("ready-to-show", async () => {
        // Show window when loaded
        configWindow.show();
    });
}

function createMenu() {
    const menu = Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                { label: 'Adjust Notification Value' },
                { label: 'CoinMarketCap' },
                {
                    label: 'Exit',
                    click() {
                        app.quit()
                    }
                }
            ]
        },
        {
            label: 'Menu',
            submenu: [
                { label: 'Adjust Notification Value' },
                { label: 'CoinMarketCap' },
                {
                    label: 'Exit',
                    click() {

                    }
                }
            ]
        },
        {
            label: 'Menu',
            submenu: [
                { label: 'Adjust Notification Value' },
                { label: 'CoinMarketCap' },
                {
                    label: 'Exit',
                    click() {
                        app.quit()
                    }
                }
            ]
        }
    ]);

    // Menu.setApplicationMenu(menu); 
}

// Save and load application's window location on screen
function saveWindowLocation() {
    const data = { bounds: mainWindow.getContentBounds() };
    fs.writeFileSync(initPath, JSON.stringify(data));
}

function loadWindowLocation() {
    try {
        const data = JSON.parse(fs.readFileSync(initPath, "utf8"));

        if (data.bounds)
            mainWindow.setBounds(data.bounds);
    }
    catch (e) { console.error("Latest User Data not found") }
}
