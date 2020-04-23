import { OPCUAClient, MessageSecurityMode, SecurityPolicy, AttributeIds, makeBrowsePath, ClientSubscription, TimestampsToReturn, MonitoringParametersOptions, ReadValueIdLike, ClientMonitoredItem, DataValue, ClientSession, NodeCrawler, DataType } from "node-opcua";
import { config } from "../../Config";
import { showNotification } from "../../Message";
import * as log from "electron-log";
import { mainWindow } from "../../../../public/electron";
import { TOpcuaTag, OpcuaHelper } from "../OpcuaHelper";


export namespace OpcuaClient {
    const
        options = {
            applicationName: "MyClient",
            connectionStrategy: config.opcuaClient.connectionStrategy,
            securityMode: MessageSecurityMode.None,
            securityPolicy: SecurityPolicy.None,
            endpoint_must_exist: false,
        },
        client = OPCUAClient.create(options),
        endpointUrl = config.opcuaClient.endpointUrl,
        tags: TOpcuaTag[] = [],
        subscriptions: ClientSubscription[] = [];

    let session: ClientSession;

    for (const tag of config.opcuaClient.tags) {
        tags.push({
            nodeId: tag.nodeId,
            dataType: tag.dataType,
            value: ""
        })
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

    export async function connect() {
        try {
            // step 1 : connect to
            await client.connect(endpointUrl);
            console.log("connected!");

            // step 2 : createSession
            session = await client.createSession();
            console.log("session created!");

            mainWindow.webContents.send("client-status", { connected: true });
            mainWindow.webContents.send("tags", { tags });

        } catch (err) {
            showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }

    function connected() {
        showNotification("info", "OPC-UA Client", `Connected to OPC UA Server.`);
    }

    export async function disconnect() {
        try {
            await client.closeSession(session, true);
            console.log("Session closed!")

            await client.disconnect();
            console.log("Disconnected!");

        } catch (err) {
            showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }

    function disconnected(isReconnecting: boolean) {
        showNotification("info", "OPC-UA Client", `OPC UA Server disconnected.${isReconnecting ? "\n Trying to reconnect." : ""}`);
    }

    export async function readNodeValue(nodeId: string) {
        try {
            const nodeToUpdate = tags.find(e => e.nodeId === nodeId);
            if (!nodeToUpdate)
                throw new Error("Tag not found.");

            const maxAge = 0;
            const nodeToRead = {
                nodeId,
                attributeId: AttributeIds.Value
            };

            nodeToUpdate.value = (await session.read(nodeToRead, maxAge)).value.value.toString();

            refreshTags();

        } catch (err) {
            showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }


    export async function writeNodeValue(nodeId: string, value: any) {
        try {
            const nodeToUpdate = tags.find(e => e.nodeId === nodeId);

            if (!nodeToUpdate)
                throw new Error("Tag not found.");

            const nodeToWrite = {
                nodeId,
                attributeId: AttributeIds.Value,
                value: {
                    value: {
                        dataType: OpcuaHelper.typeMap[nodeToUpdate.dataType],
                        value
                    }
                }
            }

            await session.write(nodeToWrite);

            nodeToUpdate.value = value.toString();

            refreshTags();

        } catch (err) {
            showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }

    export async function refreshNodes() {
        try {
            const results = await session.readVariableValue(tags.map(e => e.nodeId));

            tags.forEach((e, i) => e.value = results[i].value.value.toString());

            refreshTags();

        } catch (err) {
            showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }

    function refreshTags() {
        mainWindow.webContents.send("tag-refresh", { tags });
    }

    export async function subscribe(nodeId: string) {
        try {
            const subscription = ClientSubscription.create(session, {
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
            const
                itemToMonitor: ReadValueIdLike = {
                    nodeId,
                    attributeId: AttributeIds.Value
                },
                parameters: MonitoringParametersOptions = {
                    samplingInterval: 100,
                    discardOldest: true,
                    queueSize: 10
                },
                monitoredItem = ClientMonitoredItem.create(
                    subscription,
                    itemToMonitor,
                    parameters,
                    TimestampsToReturn.Both
                );

            subscriptions.push(subscription);

            monitoredItem.on("changed", (dataValue: DataValue) => {
                const tag = tags.find(e => e.nodeId == monitoredItem.monitoredItemId);

                if (tag) {
                    tag.value = dataValue.value.value.toString();
                    refreshTags();
                }
            })

        } catch (err) {
            showNotification("error", "OPC-UA Client", `An error has occured:\n${err}`);
            console.log("An error has occured : ", err);
        }
    }

    export async function unsibscribe(nodeId: string) {
        console.log("now terminating subscription");
        const subscription = subscriptions.find(e => e.monitoredItems[0].monitoredItemId == nodeId);
        if (subscription)
            await subscription.terminate();
    }
}
