import { DataType } from "node-opcua";

export type TOpcuaTag =
    {
        nodeId: string,
        dataType: keyof typeof OpcuaHelper.typeMap,
        value: string
    };

export class OpcuaHelper {
    static typeMap = {
        "String": DataType.String,
        "Double": DataType.Double,
        "Float": DataType.Float,
        "Integer": DataType.UInt16,
        "Datetime": DataType.DateTime,
        "Boolean": DataType.Boolean,
        "Byte": DataType.Byte
    }
}