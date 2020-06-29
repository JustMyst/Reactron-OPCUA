"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_opcua_1 = require("node-opcua");
class OpcuaHelper {
}
exports.OpcuaHelper = OpcuaHelper;
OpcuaHelper.typeMap = {
    "String": node_opcua_1.DataType.String,
    "Double": node_opcua_1.DataType.Double,
    "Float": node_opcua_1.DataType.Float,
    "Integer": node_opcua_1.DataType.UInt16,
    "Datetime": node_opcua_1.DataType.DateTime,
    "Boolean": node_opcua_1.DataType.Boolean,
    "Byte": node_opcua_1.DataType.Byte
};
//# sourceMappingURL=OpcuaHelper.js.map