import { DataType } from "node-opcua";

export type TOpcuaTag =
    {
        nodeId: string,
        dataType: keyof typeof OpcuaHelper.typeMap,
        value: string
    };

export class OpcuaHelper {
    static typeMap = {
        "string": DataType.String,
        "double": DataType.Double,
        "float": DataType.Float,
        "integer": DataType.UInt16,
        "datetime": DataType.DateTime,
        "boolean": DataType.Boolean,
        "byte": DataType.Byte
    }
}