"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_opcua_1 = require("node-opcua");
class OpcuaHelper {
}
exports.OpcuaHelper = OpcuaHelper;
OpcuaHelper.typeMap = {
    "string": node_opcua_1.DataType.String,
    "double": node_opcua_1.DataType.Double,
    "float": node_opcua_1.DataType.Float,
    "integer": node_opcua_1.DataType.UInt16,
    "datetime": node_opcua_1.DataType.DateTime,
    "boolean": node_opcua_1.DataType.Boolean,
    "byte": node_opcua_1.DataType.Byte
};
//# sourceMappingURL=OpcuaHelper.js.map