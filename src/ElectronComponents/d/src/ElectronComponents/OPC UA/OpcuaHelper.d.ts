import { DataType } from "node-opcua";
export declare type TOpcuaTag = {
    nodeId: string;
    dataType: keyof typeof OpcuaHelper.typeMap;
    value: string;
};
export declare class OpcuaHelper {
    static typeMap: {
        "String": DataType;
        "Double": DataType;
        "Float": DataType;
        "Integer": DataType;
        "Datetime": DataType;
        "Boolean": DataType;
        "Byte": DataType;
    };
}
