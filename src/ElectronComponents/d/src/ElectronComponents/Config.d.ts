export declare let config: IConfig;
export interface IConfig extends IAutoUpdaterConfig, IDisplayConfig, IOpcuaClientConfig, IOpcuaServerConfig {
}
export declare type TDataTypes = "string" | "double" | "float" | "integer" | "datetime" | "boolean" | "byte";
export declare type TNodeTypes = "manual" | "random" | "incremental";
export declare type TInstallAction = "prompt" | "onExit";
export declare function setConfig(newConfig: IConfig): void;
interface IDisplayConfig {
    display: {
        kioskMode: boolean;
        width: number;
        height: number;
    };
}
interface IAutoUpdaterConfig {
    autoUpdater: {
        updateServerUrl: string;
        installAction: TInstallAction;
        frequencyH: number;
    };
}
interface IOpcuaClientConfig {
    opcuaClient: {
        connectionStrategy: {
            initialDelay: number;
            maxRetry: number;
        };
        endpointUrl: string;
        tags: IBaseTag[];
    };
}
interface IOpcuaServerConfig {
    opcuaServer: {
        port: number;
        tags: IServerTag[];
    };
}
export interface IBaseTag {
    nodeId: string;
    dataType: TDataTypes;
}
export interface IClientTag extends IBaseTag {
    value?: string;
    isSubscribed?: boolean;
}
export interface IServerTag extends IBaseTag {
    type: TNodeTypes;
    value?: string;
    valueF?: () => string;
}
export {};
