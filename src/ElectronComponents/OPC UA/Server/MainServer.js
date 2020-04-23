import { OPCUAServer, Variant, DataType, StatusCodes } from "node-opcua";
import { config } from "../../Config";
import { OpcuaHelper } from "../OpcuaHelper";
export var OpcuaServer;
(function (OpcuaServer) {
    const server = new OPCUAServer({
        port: 4334,
        resourcePath: "/UA/MyLittleServer",
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
            nodeId: "ns=1;b=1020FFAA",
            browseName: "MyVariable2",
            dataType: "Double",
            value: {
                get: function () {
                    return new Variant({ dataType: DataType.Double, value: variable2 });
                },
                set: function (variant) {
                    variable2 = parseFloat(variant.value);
                    return StatusCodes.Good;
                }
            }
        });
        namespace.addVariable({
            componentOf: device,
            nodeId: "s=free_memory",
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
                        });
                    },
                    set: tag.type === "manual" ? (variant) => {
                        tag.value = variant.value;
                        return StatusCodes.Good;
                    } : undefined
                }
            });
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
    function startServer() {
        server.initialize(post_initialize);
    }
    OpcuaServer.startServer = startServer;
    function stopServer() {
        server.shutdown();
    }
    OpcuaServer.stopServer = stopServer;
    function updateNodeValue(nodeId, value) {
        const updatedTag = config.opcuaServer.tags.find(e => e.nodeId === nodeId);
        if (updatedTag)
            updatedTag.value = value;
    }
    OpcuaServer.updateNodeValue = updateNodeValue;
})(OpcuaServer || (OpcuaServer = {}));
//# sourceMappingURL=MainServer.js.map