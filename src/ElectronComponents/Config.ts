export let config = <IConfig>require(`../config.json`);

export interface IConfig extends IAutoUpdaterConfig, IDisplayConfig, IOpcuaClientConfig, IOpcuaServerConfig {

}

export type TDataTypes = "String" | "Double" | "Float" | "Integer" | "Datetime" | "Boolean" | "Byte";
export type TNodeTypes = "manual" | "random" | "incremental";
export type TInstallAction = "prompt" | "onExit";

export function setConfig(newConfig: IConfig) {
    config = newConfig;
}

interface IDisplayConfig {
    display: {
        kioskMode: boolean;
        width: number;
        height: number;
    }
}

interface IAutoUpdaterConfig {
    autoUpdater: {
        updateServerUrl: string,
        installAction: TInstallAction,
        frequencyH: number
    }
}

interface IOpcuaClientConfig {
    opcuaClient: {
        connectionStrategy: {
            initialDelay: number,
            maxRetry: number
        },
        endpointUrl: string,
        tags: IBaseTag[]
    }
}

interface IOpcuaServerConfig {
    opcuaServer: {
        port: number,
        tags: IServerTag[]
    }
}

export interface IBaseTag {
    nodeId: string,
    dataType: TDataTypes
}

export interface IClientTag extends IBaseTag {
    value?: string;
    isSubscribed?: boolean;
}

export interface IServerTag extends IBaseTag {
    type: TNodeTypes
    value?: string,
    valueF?: () => string
}