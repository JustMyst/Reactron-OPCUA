import React from 'react';
import '../App.css';
import { Table, Button, Row, Col, Container, Tabs, Tab } from "react-bootstrap";
import { IClientTag, config, IServerTag } from '../ElectronComponents/Config';

const { ipcRenderer } = window.require("electron");

export class Config extends React.Component {
    render() {
        return (
            <Container>
                <Row>
                    <Tabs defaultActiveKey="server" id="mainTab">
                        <Tab eventKey="server" title="Server Configuration">
                            <h3>Server Options</h3>
                            <div>
                                <label>OPC-UA Port</label>
                                <input type="number" value={config.opcuaServer.port} />
                            </div>
                            <h3>Tags</h3>
                            {config.opcuaServer.tags.map((e: IServerTag, i: number) =>
                                <div>
                                    <label>Node ID</label>
                                    <input type="text" value={e.nodeId} />


                                    <label>Data Type</label>
                                    <input type="text" value={e.dataType} />


                                    <label>Type</label>
                                    <input type="text" value={e.type} />
                                </div>
                            )}
                        </Tab>
                        <Tab eventKey="client" title="Client Configuration">
                            <h3>Server Options</h3>
                            <div>
                                <label>OPC-UA Server URL</label>
                                <input type="string" value={config.opcuaClient.endpointUrl} />
                                <label>Connection Initial Delay</label>
                                <input type="number" value={config.opcuaClient.connectionStrategy.initialDelay} />
                                <label>Connection Max Retry</label>
                                <input type="number" value={config.opcuaClient.connectionStrategy.maxRetry} />
                            </div>
                            <h3>Tags</h3>
                            {config.opcuaClient.tags.map((e: IClientTag, i: number) =>
                                <div>
                                    <label>Node ID</label>
                                    <input type="text" value={e.nodeId} />


                                    <label>Data Type</label>
                                    <input type="text" value={e.dataType} />
                                </div>
                            )}
                        </Tab>
                        <Tab eventKey="display" title="Display">
                            <div>
                                <label>Kiosk Mode</label>
                                <input type="checkbox" checked={config.display.kioskMode} />
                                <label>Default Width</label>
                                <input type="number" value={config.display.width} />
                                <label>Defailt Height</label>
                                <input type="number" value={config.display.height} />
                            </div>
                        </Tab>
                        <Tab eventKey="updater" title="Auto Updater">
                            <div>
                                <label>Auto Update Server URL</label>
                                <input type="string" value={config.autoUpdater.updateServerUrl} />
                                <label>Action upon new Version</label>
                                <input type="string" value={config.autoUpdater.installAction} />
                                <label>Frequency of update checking</label>
                                <input type="number" value={config.autoUpdater.frequencyH} />
                            </div>
                        </Tab>
                    </Tabs>
                </Row>
                <Row>
                    <Button variant="primary" onClick={() => this.saveConfig()}>Save</Button>
                </Row>
            </Container>
        );
    }

    saveConfig() {
        ipcRenderer.send("save-config", config);
    }
}