import { DataType } from "node-opcua";
export class OpcuaHelper {
}
OpcuaHelper.typeMap = {
    "string": DataType.String,
    "double": DataType.Double,
    "float": DataType.Float,
    "integer": DataType.UInt16,
    "datetime": DataType.DateTime,
    "boolean": DataType.Boolean,
    "byte": DataType.Byte
};
//# sourceMappingURL=OpcuaHelper.js.map