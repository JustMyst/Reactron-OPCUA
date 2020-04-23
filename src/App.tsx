import React from 'react';
import './App.css';
import { Client } from "./ReactComponents/Client";
import { Server } from "./ReactComponents/Server";
import { Tab, Tabs } from "react-bootstrap";
import { electronApi, initApi } from "./ElectronApi";
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Config } from './ReactComponents/Config';

function App() {
  if (!electronApi)
    throw new Error("Application works only within Electron.");

  initApi();

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Tabs defaultActiveKey="server" id="mainTab">
            <Tab eventKey="server" title="OPC-UA Server">
              <Server />
            </Tab>
            <Tab eventKey="client" title="OPC-UA Client">
              <Client />
            </Tab>
          </Tabs>
        </Route>
        <Route path="/config">
          <Config />
        </Route>
      </Switch>
    </Router>
  );
}
export default App;
