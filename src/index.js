/** @format */

import React from "react";
import ReactDOM from "react-dom";
import OverlayAPI from "ffxiv-overlay-api";

import { HashRouter as Router, Route, Switch } from "react-router-dom";

import Overlay from "./Overlay";
import Config from "./Config";
import NotFound from "./NotFound";
import SetupMode from "./SetupMode";
// import { startTesting } from "./testing/testing.js";

require(`./images/handle.png`);

window.lastData = {};
const Inactive = (detail) => {
  return (
    <Router basename={`${process.env.PUBLIC_URL}`}>
      <Switch>
        <Route path={`/config`} component={Config} />
        <Route component={SetupMode} />
      </Switch>
    </Router>
  );
};

let inCutscene = false;
let primaryID = null;

const InCutscene = () => {
  return null;
};

const Root = (detail) => {
  return (
    <Router basename={`${process.env.PUBLIC_URL}`}>
      <Switch>
        <Route path={`/`} render={() => <Overlay {...detail} />} />
        <Route exact path={`/config`} component={Config} />
        <Route render={() => <NotFound text="Page Not Found!" />} />
      </Switch>
    </Router>
  );
};

let lastDetail = null;

function renderDetail(detail) {
  if (!detail) {
    ReactDOM.render(<Inactive />, document.getElementById("root"));
  } else {
    lastDetail = detail;
    ReactDOM.render(<Root {...detail} />, document.getElementById("root"));
  }
}

function render(detail) {
  if (inCutscene) {
    // 过场中
    if (detail) {
      if (detail.isActive === "false") {
        // 战斗结束隐藏
        ReactDOM.render(<InCutscene />, document.getElementById("root"));
      } else {
        renderDetail(detail);
      }
    } else {
      ReactDOM.render(<InCutscene />, document.getElementById("root"));
    }
  } else {
    // 过场结束
    renderDetail(detail);
  }
}
render();

// 新的监听方式
// OverlayAPI.
const overlay = new OverlayAPI({
  extendData: true,
  silentMode: true,
});

overlay.addListener("CombatData", (data) => {
  render(data);
});
// overlay.addListener('ChangeZone', (data) => {
//   console.log('listener of `ChangeZone`', data);
// });
overlay.addListener("OnlineStatusChanged", (data) => {
  if (primaryID === data.target) {
    // console.log("listener of `OnlineStatusChanged`", data);
    inCutscene = data.status === "InCutscene";
    render(inCutscene ? null : lastDetail);
  }
});
overlay.addListener("ChangePrimaryPlayer", (data) => {
  primaryID = data.charID;
});

overlay.startEvent();

// startTesting(overlay);
