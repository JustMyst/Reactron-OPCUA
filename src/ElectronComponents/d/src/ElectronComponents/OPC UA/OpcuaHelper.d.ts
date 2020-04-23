import { DataType } from "node-opcua";
export declare type TOpcuaTag = {
    nodeId: string;
    dataType: keyof typeof OpcuaHelper.typeMap;
    value: string;
};
export declare class OpcuaHelper {
    static typeMap: {
        "string": DataType;
        "double": DataType;
        "float": DataType;
        "integer": DataType;
        "datetime": DataType;
        "boolean": DataType;
        "byte": DataType;
    };
}
