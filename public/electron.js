"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const isDev = __importStar(require("electron-is-dev"));
const Config_1 = require("../src/ElectronComponents/Config");
const AutoUpdater_1 = require("../src/ElectronComponents/AutoUpdater");
const Message_1 = require("../src/ElectronComponents/Message");
exports.webviews = [];
exports.initPath = path.join(electron_1.app.getPath("userData"), "init.json");
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
electron_1.app.on("ready", async () => {
    if (process.platform === "win32") {
        electron_1.app.setAppUserModelId("com.kamilchowaniec.reactron");
    }
    exports.mainWindow = new electron_1.BrowserWindow({
        show: false,
        width: Config_1.config.display.width,
        height: Config_1.config.display.height,
        minWidth: 900,
        minHeight: 600,
        icon: "./favicon.ico",
        backgroundColor: "#fff",
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    });
    exports.mainWindow.setTitle("reactron");
    createMenu();
    // Load latest window location
    loadWindowLocation();
    // Load Main HTML file
    exports.mainWindow.loadURL(isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`);
    exports.mainWindow.once("ready-to-show", async () => {
        // Show window when loaded
        exports.mainWindow.show();
        Message_1.initCommunication();
        // Initiate AutoUpdater if config has required data
        if (Config_1.config.autoUpdater?.updateServerUrl)
            exports.autoUpdater = new AutoUpdater_1.Updater();
    });
});
// Quit when all windows are closed.
electron_1.app.on("window-all-closed", () => {
    saveWindowLocation();
    electron_1.app.quit();
});
process.on("uncaughtException", (err) => {
});
function openConfig() {
    exports.configWindow = new electron_1.BrowserWindow({
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
    exports.configWindow.loadURL(isDev
        ? "http://localhost:3000/#/config"
        : `file://${path.join(__dirname, "../build/index.html/#/config")}`);
    exports.configWindow.removeMenu();
    exports.configWindow.once("ready-to-show", async () => {
        // Show window when loaded
        exports.configWindow.show();
    });
}
exports.openConfig = openConfig;
function createMenu() {
    const menu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                { label: 'Adjust Notification Value' },
                { label: 'CoinMarketCap' },
                {
                    label: 'Exit',
                    click() {
                        electron_1.app.quit();
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
                        electron_1.app.quit();
                    }
                }
            ]
        }
    ]);
    // Menu.setApplicationMenu(menu); 
}
// Save and load application's window location on screen
function saveWindowLocation() {
    const data = { bounds: exports.mainWindow.getContentBounds() };
    fs.writeFileSync(exports.initPath, JSON.stringify(data));
}
function loadWindowLocation() {
    try {
        const data = JSON.parse(fs.readFileSync(exports.initPath, "utf8"));
        if (data.bounds)
            exports.mainWindow.setBounds(data.bounds);
    }
    catch (e) {
        console.error("Latest User Data not found");
    }
}
//# sourceMappingURL=electron.js.map