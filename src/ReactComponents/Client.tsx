import React from 'react';
import '../App.css';
import { Container, Row, Col, Button } from "react-bootstrap";
import { TagList } from './TagList';
import { config } from '../ElectronComponents/Config';

const { ipcRenderer } = window.require("electron");


export class Client extends React.Component {
    private serverPath: string = "";
    private isConnecting: boolean = false;
    private isConnected: boolean = false;
    private tags: any;

    constructor(props: any) {
        super(props);

        this.serverPath = config.opcuaClient.endpointUrl;
    }

    render() {
        return (
            <Container>
                <Row className="justify-content-md-center">
                    <Col md="auto">Current server:</Col>
                    <Col md="auto">{this.serverPath || "None"}</Col>
                    <Col md="auto"><Button variant="outline-secondary" onClick={() => this.changeServerPath()} > Change Server Path</Button></Col>
                </Row>

                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <Button variant="primary" size="lg" onClick={() => this.toggleServer()}> {this.isConnected ? "Disconnect" : this.isConnecting ? "Connecting" : "Connect"}</Button>
                    </Col>
                </Row>
                <TagList />
            </Container>
        );
    }

    changeServerPath() {
        ipcRenderer.send("open-config");
    }

    toggleServer() { // todo
        this.isConnected = !this.isConnected;
        this.forceUpdate();
        console.log(this.isConnected);

        ipcRenderer.send("refresh-nodes");
    }
}