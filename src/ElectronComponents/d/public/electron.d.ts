import { BrowserWindow, WebContents } from "electron";
import { Updater } from "../src/ElectronComponents/AutoUpdater";
export declare let mainWindow: BrowserWindow, configWindow: BrowserWindow, autoUpdater: Updater;
export declare const webviews: (WebContents & {
    name: string;
})[];
export declare const initPath: string;
export declare function openConfig(): void;
