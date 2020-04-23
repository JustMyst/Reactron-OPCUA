import { OPCUAServer, Variant, DataType, StatusCodes } from "node-opcua";
import { config, IServerTag } from "../../Config";
import { showNotification } from "../../Message";
import * as log from "electron-log";
import { mainWindow } from "../../../../public/electron";
import { TOpcuaTag, OpcuaHelper } from "../OpcuaHelper";

export namespace OpcuaServer {
    const server = new OPCUAServer({
        port: 4334, // the port of the listening socket of the server
        resourcePath: "/UA/MyLittleServer", // this path will be added to the endpoint resource name
        buildInfo: {
            productName: "MySampleServer1",
            buildNumber: "7658",
            buildDate: new Date()
        }
    });

    function post_initialize() {
        console.log("initialized");



        const addressSpace = server.engine.addressSpace;

        if (!addressSpace)
            throw new Error("Address Space not found.");

        const namespace = addressSpace.getOwnNamespace();

        // declare a new object
        const device = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "MyDevice"
        });

        // add some variables
        // add a variable named MyVariable1 to the newly created folder "MyDevice"
        let variable1 = 1;

        // emulate variable1 changing every 500 ms
        setInterval(function () { variable1 += 1; }, 500);

        namespace.addVariable({
            componentOf: device,
            browseName: "MyVariable1",
            dataType: "Double",
            value: {
                get: function () {
                    return new Variant({ dataType: DataType.Double, value: variable1 });
                }
            }
        });

        // add a variable named MyVariable2 to the newly created folder "MyDevice"
        let variable2 = 10.0;

        namespace.addVariable({

            componentOf: device,

            nodeId: "ns=1;b=1020FFAA", // some opaque NodeId in namespace 4

            browseName: "MyVariable2",

            dataType: "Double",

            value: {
                get: function () {
                    return new Variant({ dataType: DataType.Double, value: variable2 });
                },
                set: function (variant: Variant) {
                    variable2 = parseFloat(variant.value);
                    return StatusCodes.Good;
                }
            }
        });

        namespace.addVariable({

            componentOf: device,

            nodeId: "s=free_memory", // a string nodeID
            browseName: "FreeMemory",
            dataType: "Double",
            value: {
                get: function () { return new Variant({ dataType: DataType.Double, value: available_memory() }); }
            }
        });

        for (const tag of config.opcuaServer.tags)
            namespace.addVariable({
                componentOf: device,
                nodeId: tag.nodeId,
                browseName: tag.nodeId,
                dataType: tag.dataType,
                value: {
                    get: () => {
                        return new Variant({
                            dataType: OpcuaHelper.typeMap[tag.dataType],
                            value: tag.value || 0
                        })
                    },
                    set: tag.type === "manual" ? (variant: Variant) => {
                        tag.value = variant.value;
                        return StatusCodes.Good;
                    } : undefined
                }
            })

        server.start(function () {
            console.log("Server is now listening ... ( press CTRL+C to stop)");
            console.log("port ", server.endpoints[0].port);

            const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
            console.log(" the primary server endpoint url is ", endpointUrl);
        });
    }


    function available_memory() {
        const os = require("os");

        // var value = process.memoryUsage().heapUsed / 1000000;
        const percentageMemUsed = os.freemem() / os.totalmem() * 100.0;
        return percentageMemUsed;
    }


    export function startServer() {
        server.initialize(post_initialize);
    }

    export function stopServer() {
        server.shutdown();
    }

    export function updateNodeValue(nodeId: string, value: string) {
        const updatedTag = config.opcuaServer.tags.find(e => e.nodeId === nodeId);
        if (updatedTag)
            updatedTag.value = value;
    }
}