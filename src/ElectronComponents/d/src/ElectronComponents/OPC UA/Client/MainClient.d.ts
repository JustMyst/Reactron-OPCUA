export declare namespace OpcuaClient {
    function connect(): Promise<void>;
    function disconnect(): Promise<void>;
    function readNodeValue(nodeId: string): Promise<void>;
    function writeNodeValue(nodeId: string, value: any): Promise<void>;
    function refreshNodes(): Promise<void>;
    function subscribe(nodeId: string): Promise<void>;
    function unsibscribe(nodeId: string): Promise<void>;
}
