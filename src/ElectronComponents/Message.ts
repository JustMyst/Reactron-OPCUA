import { ipcMain, dialog, app } from "electron";
import { mainWindow, openConfig } from "../../public/electron";
import * as log from "electron-log";
import { OpcuaClient } from "./OPC UA/Client/MainClient";
import { OpcuaServer } from "./OPC UA/Server/MainServer";
import { config, setConfig } from "./Config";
import * as fs from "fs"

export function initCommunication() {

    // Server Side
    ipcMain.on("set-nodes", (ev, data) => {
        config.opcuaServer.tags = data.tags;

        saveConfig();
    });

    ipcMain.on("update-node-value", (ev, data) => {
        OpcuaServer.updateNodeValue(data.nodeId, data.value);
    });

    ipcMain.on("run-server", (ev, data) => {
        OpcuaServer.startServer();
    });

    ipcMain.on("close-server", (ev, data) => {
        OpcuaServer.stopServer();
    });

    // Cient Side
    ipcMain.on("write-node", (ev, data) => {
        OpcuaClient.writeNodeValue(data.nodeId, data.value);
    });

    ipcMain.on("read-node", (ev, data) => {
        OpcuaClient.readNodeValue(data.nodeId);
    });

    ipcMain.on("refresh-nodes", (ev, data) => {
        OpcuaClient.refreshNodes();
    });

    ipcMain.on("subscribe-node", (ev, data) => {
        OpcuaClient.subscribe(data.nodeId);
    });

    ipcMain.on("unsunscribe-node", (ev, data) => {
        OpcuaClient.unsibscribe(data.nodeId);
    });

    ipcMain.on("connect-to-server", (ev, data) => {
        OpcuaClient.connect();
    });

    ipcMain.on("disconnect-from-server", (ev, data) => {
        OpcuaClient.disconnect();
    });

    ipcMain.on("open-config", (ev, data) => {
        openConfig();
    })

    ipcMain.on("save-config", (ev, data) => {
        setConfig(data.config);
        saveConfig();
    })

};

export function saveConfig() {
    fs.writeFile(`../config.json`, JSON.stringify(config), (er) => { throw new Error("Could not save config file.\n" + er?.message) })
}

export function showNotification(type: "info" | "error", title: string, body: string, timeoutS = 10) {
    mainWindow.webContents.send("notification", { type, title, body, timeoutS });
    type === "info" ? log.info(body) : log.error(body);
}