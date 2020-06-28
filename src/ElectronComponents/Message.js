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
const electron_2 = require("../../public/electron");
const log = __importStar(require("electron-log"));
const MainClient_1 = require("./OPC UA/Client/MainClient");
const MainServer_1 = require("./OPC UA/Server/MainServer");
const Config_1 = require("./Config");
const fs = __importStar(require("fs"));
function initCommunication() {
    // Server Side
    electron_1.ipcMain.on("set-nodes", (ev, data) => {
        Config_1.config.opcuaServer.tags = data.tags;
        saveConfig();
    });
    electron_1.ipcMain.on("update-node-value", (ev, data) => {
        MainServer_1.OpcuaServer.updateNodeValue(data.nodeId, data.value);
    });
    electron_1.ipcMain.on("run-server", (ev, data) => {
        MainServer_1.OpcuaServer.startServer();
    });
    electron_1.ipcMain.on("close-server", (ev, data) => {
        MainServer_1.OpcuaServer.stopServer();
    });
    // Cient Side
    electron_1.ipcMain.on("write-node", (ev, data) => {
        MainClient_1.OpcuaClient.writeNodeValue(data.nodeId, data.value);
    });
    electron_1.ipcMain.on("read-node", (ev, data) => {
        MainClient_1.OpcuaClient.readNodeValue(data.nodeId);
    });
    electron_1.ipcMain.on("refresh-nodes", (ev, data) => {
        MainClient_1.OpcuaClient.refreshNodes();
    });
    electron_1.ipcMain.on("subscribe-node", (ev, data) => {
        MainClient_1.OpcuaClient.subscribe(data.nodeId);
    });
    electron_1.ipcMain.on("unsunscribe-node", (ev, data) => {
        MainClient_1.OpcuaClient.unsibscribe(data.nodeId);
    });
    electron_1.ipcMain.on("connect-to-server", (ev, data) => {
        MainClient_1.OpcuaClient.connect();
    });
    electron_1.ipcMain.on("disconnect-from-server", (ev, data) => {
        MainClient_1.OpcuaClient.disconnect();
    });
    electron_1.ipcMain.on("open-config", (ev, data) => {
        electron_2.openConfig();
    });
    electron_1.ipcMain.on("save-config", (ev, data) => {
        Config_1.setConfig(data.config);
        saveConfig();
    });
}
exports.initCommunication = initCommunication;
;
function saveConfig() {
    fs.writeFile(`../config.json`, JSON.stringify(Config_1.config), (er) => { throw new Error("Could not save config file.\n" + er?.message); });
}
exports.saveConfig = saveConfig;
function showNotification(type, title, body, timeoutS = 10) {
    electron_2.mainWindow.webContents.send("notification", { type, title, body, timeoutS });
    type === "info" ? log.info(body) : log.error(body);
}
exports.showNotification = showNotification;
//# sourceMappingURL=Message.js.map