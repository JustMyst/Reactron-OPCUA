import React from 'react';
import '../App.css';
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { config, IServerTag, TDataTypes, TNodeTypes } from '../ElectronComponents/Config';

const { ipcRenderer } = window.require("electron");


export class Server extends React.Component<{}, { tags: IServerTag[] }> {
    private _isRunning: boolean = false;
    private _tags: IServerTag[];
    private _isSaved: boolean = true;

    constructor(props: any) {
        super(props);

        this.state = {
            tags: config.opcuaServer.tags
        };

        this._tags = config.opcuaServer.tags.slice();
    }

    render() {
        return (
            <Container>
                <Row className="justify-content-md-center">
                    <Col md="3">
                        <span>Port:{config.opcuaServer.port}</span>
                    </Col>
                    <Col md="3">
                        <Button variant="primary" onClick={() => this.toggleServer()}>{this._isRunning ? "Stop Server" : "Start Server"}</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Node ID</th>
                                    <th>Data Type</th>
                                    <th>Simulation Type</th>
                                    <th>Value</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this._tags.map((e: IServerTag, i: number) =>
                                    <tr>
                                        <th>{i + 1}</th>
                                        <th><input type="text" value={e.nodeId} onChange={(ev) => {
                                            e.nodeId = ev.target.value;
                                            this.setState({ tags: this._tags });
                                        }} /></th>
                                        <th><input type="text" value={e.dataType} onChange={(ev) => {
                                            e.dataType = ev.target.value as TDataTypes;
                                            this.setState({ tags: this._tags });
                                        }} /></th>
                                        <th><input type="text" value={e.type} onChange={(ev) => {
                                            e.type = ev.target.value as TNodeTypes;
                                            this.setState({ tags: this._tags });
                                        }} /></th>
                                        <th><input type="text" value={e.value} disabled={e.type !== "manual"} /></th>
                                        <th>{e.type === "manual" ? <Button variant="outline-secondary" onClick={() => this.updateValue(e.nodeId, e.value)}>updateValue</Button> : ""}</th>
                                    </tr>)}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Row>
                    <Button variant="secondary" onClick={() => this.addNode()}>Add Node</Button>
                    <Button variant="secondary" onClick={() => this.saveNode()}>Save Nodes</Button>
                </Row>
            </Container>
        );
    }

    handleChange(ev) {
        this.setState({ tags: this._tags });
    }

    toggleServer() {
        ipcRenderer.send(this._isRunning ? "close-server" : "run-server");
        this._isRunning = !this._isRunning;
        this.forceUpdate();
    }

    updateValue(nodeId: string, value: string = "0") {
        ipcRenderer.send("update-node-value", { nodeId, value })
    }

    addNode() {
        this._tags.push({
            nodeId: "",
            dataType: "String",
            value: "",
            type: "manual"
        });
        this.setState({ tags: this._tags });
    }

    saveNode() {
        for (const tag of this._tags)
            if (tag.nodeId.length === 0)
                throw new Error("Node IDs not set properly.");

        ipcRenderer.send("set-nodes", { tags: this._tags });
    }
}