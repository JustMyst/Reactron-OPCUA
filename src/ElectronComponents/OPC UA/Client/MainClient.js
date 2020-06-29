"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_opcua_1 = require("node-opcua");
const Config_1 = require("../../Config");
const Message_1 = require("../../Message");
const log = __importStar(require("electron-log"));
const electron_1 = require("../../../../public/electron");
const OpcuaHelper_1 = require("../OpcuaHelper");
var OpcuaClient;
(function (OpcuaClient) {
    const options = {
        applicationName: "MyClient",
        connectionStrategy: Config_1.config.opcuaClient.connectionStrategy,
        securityMode: node_opcua_1.MessageSecurityMode.None,
        securityPolicy: node_opcua_1.SecurityPolicy.None,
        endpoint_must_exist: false,
    }, client = node_opcua_1.OPCUAClient.create(options), endpointUrl = Config_1.config.opcuaClient.endpointUrl, tags = [], subscriptions = [];
    let session;
    for (const tag of Config_1.config.opcuaClient.tags) {
        tags.push({
            nodeId: tag.nodeId,
            dataType: tag.dataType,
            value: ""
        });
    }
    client
        .on("connected", () => {
        connected();
    })
        .on("connection_lost", () => {
        disconnected(client.isReconnecting);
    })
        .on("connection_reestablished", () => {
        connected();
    })
        .on("backoff", (count, delay) => {
        log.info(`backoff count = ${count}, delay = ${delay}`);
    });
    async function connect() {
        try {
            // step 1 : connect to
            await client.connect(endpointUrl);
            console.log("connected!");
            // step 2 : createSession
            session = await client.createSession();
            console.log("session created!");
            electron_1.mainWindow.webContents.send("client-status", { connected: true });
            electron_1.mainWindow.webContents.send("tags", { tags });
        }
        catch (err) {
            Message_1.showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }
    OpcuaClient.connect = connect;
    function connected() {
        Message_1.showNotification("info", "OPC-UA Client", `Connected to OPC UA Server.`);
    }
    async function disconnect() {
        try {
            await client.closeSession(session, true);
            console.log("Session closed!");
            await client.disconnect();
            console.log("Disconnected!");
        }
        catch (err) {
            Message_1.showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }
    OpcuaClient.disconnect = disconnect;
    function disconnected(isReconnecting) {
        Message_1.showNotification("info", "OPC-UA Client", `OPC UA Server disconnected.${isReconnecting ? "\n Trying to reconnect." : ""}`);
    }
    async function readNodeValue(nodeId) {
        try {
            const nodeToUpdate = tags.find(e => e.nodeId === nodeId);
            if (!nodeToUpdate)
                throw new Error("Tag not found.");
            const maxAge = 0;
            const nodeToRead = {
                nodeId,
                attributeId: node_opcua_1.AttributeIds.Value
            };
            nodeToUpdate.value = (await session.read(nodeToRead, maxAge)).value.value.toString();
            refreshTags();
        }
        catch (err) {
            Message_1.showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }
    OpcuaClient.readNodeValue = readNodeValue;
    async function writeNodeValue(nodeId, value) {
        try {
            const nodeToUpdate = tags.find(e => e.nodeId === nodeId);
            if (!nodeToUpdate)
                throw new Error("Tag not found.");
            const nodeToWrite = {
                nodeId,
                attributeId: node_opcua_1.AttributeIds.Value,
                value: {
                    value: {
                        dataType: OpcuaHelper_1.OpcuaHelper.typeMap[nodeToUpdate.dataType],
                        value
                    }
                }
            };
            await session.write(nodeToWrite);
            nodeToUpdate.value = value.toString();
            refreshTags();
        }
        catch (err) {
            Message_1.showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }
    OpcuaClient.writeNodeValue = writeNodeValue;
    async function refreshNodes() {
        try {
            const results = await session.readVariableValue(tags.map(e => e.nodeId));
            tags.forEach((e, i) => e.value = results[i].value.value.toString());
            refreshTags();
        }
        catch (err) {
            Message_1.showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }
    OpcuaClient.refreshNodes = refreshNodes;
    function refreshTags() {
        electron_1.mainWindow.webContents.send("tags", { tags });
    }
    async function subscribe(nodeId) {
        try {
            const subscription = node_opcua_1.ClientSubscription.create(session, {
                requestedPublishingInterval: 1000,
                requestedLifetimeCount: 100,
                requestedMaxKeepAliveCount: 10,
                maxNotificationsPerPublish: 100,
                publishingEnabled: true,
                priority: 10
            });
            subscription.on("started", function () {
                console.log("subscription started for 2 seconds - subscriptionId=", subscription.subscriptionId);
            }).on("keepalive", function () {
                console.log("keepalive");
            }).on("terminated", function () {
                console.log("terminated");
            });
            // install monitored item
            const itemToMonitor = {
                nodeId,
                attributeId: node_opcua_1.AttributeIds.Value
            }, parameters = {
                samplingInterval: 100,
                discardOldest: true,
                queueSize: 10
            }, monitoredItem = node_opcua_1.ClientMonitoredItem.create(subscription, itemToMonitor, parameters, node_opcua_1.TimestampsToReturn.Both);
            subscriptions.push(subscription);
            monitoredItem.on("changed", (dataValue) => {
                const tag = tags.find(e => e.nodeId == monitoredItem.monitoredItemId);
                if (tag) {
                    tag.value = dataValue.value.value.toString();
                    refreshTags();
                }
            });
        }
        catch (err) {
            Message_1.showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }
    OpcuaClient.subscribe = subscribe;
    async function unsibscribe(nodeId) {
        console.log("now terminating subscription");
        const subscription = subscriptions.find(e => e.monitoredItems[0].monitoredItemId == nodeId);
        if (subscription)
            await subscription.terminate();
    }
    OpcuaClient.unsibscribe = unsibscribe;
})(OpcuaClient = exports.OpcuaClient || (exports.OpcuaClient = {}));
//# sourceMappingURL=MainClient.js.map