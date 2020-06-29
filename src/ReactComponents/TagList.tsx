import React from 'react';
import '../App.css';
import { Table, Button } from "react-bootstrap";
import { IClientTag } from '../ElectronComponents/Config';

const { ipcRenderer } = window.require("electron");

export class TagList extends React.Component<{}, { tags: IClientTag[] }> {
    private _tags: IClientTag[];

    constructor(props: any) {
        super(props);

        this.state = {
            tags: []
        }

        this._tags = this.state.tags;

        ipcRenderer.on("tags", (ev, data) => {
            this._tags = data.tags;
            this.forceUpdate();
        })
    }

    render() {
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Node ID</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this._tags.map((e: IClientTag, i: number) =>
                        <tr>
                            <th>{i + 1}</th>
                            <th>{e.nodeId}</th>
                            <th>{e.dataType}</th>
                            <th><input type="text" value={e.value} /></th>
                            <th><Button variant="outline-secondary" onClick={() => this.readNode(e.nodeId)}>Read Value</Button></th>
                            <th><Button variant="outline-secondary" onClick={() => this.writeNode(e.nodeId, e.value)}>Write Value</Button></th>
                            <th><Button variant="outline-secondary" onClick={() => this.toggleSub(e.nodeId, e.isSubscribed || false)}>Toggle Subscribtion</Button></th>
                        </tr>)}
                </tbody>
            </Table>
        );
    }

    readNode(nodeId: string) {
        ipcRenderer.send("read-node", { nodeId });
    }

    writeNode(nodeId: string, value: string = "") {
        ipcRenderer.send("write-node", { nodeId, value });
    }

    toggleSub(nodeId: string, isSubscribed: boolean) {
        if (!isSubscribed)
            ipcRenderer.send("subscribe-node", { nodeId });
        else
            ipcRenderer.send("unsubscribe-node", { nodeId });

        isSubscribed = !isSubscribed;
    }

}