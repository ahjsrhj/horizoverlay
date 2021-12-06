// uncomment for testing
// import './testing/testing'

import React from 'react'
import ReactDOM from 'react-dom'
import OverlayAPI from 'ffxiv-overlay-api';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Overlay from './Overlay'
import Config from './Config'
import NotFound from './NotFound'
import SetupMode from './SetupMode'
import initActWebSocket from './actwebsocket'

// require('./testing/testing.js')

require(`./images/handle.png`)

initActWebSocket()

window.lastData = {}
const Inactive = detail => {
  return (
    <Router basename={`${process.env.PUBLIC_URL}`}>
      <Switch>
        <Route path={`/config`} component={Config} />
        <Route component={SetupMode} />
      </Switch>
    </Router>
  )
}

const Root = detail => {
  return (
    <Router basename={`${process.env.PUBLIC_URL}`}>
      <Switch>
        <Route path={`/`} render={() => <Overlay {...detail} />} />
        <Route exact path={`/config`} component={Config} />
        <Route render={() => <NotFound text="Page Not Found!" />} />
      </Switch>
    </Router>
  )
}

// This will run when data is ON
function onOverlayDataUpdate(e) {
  const detail = (e.detail.msg ? e.detail.msg : e.detail)
  
  ReactDOM.render(<Root {...detail} />, document.getElementById('root'))
}
// This will run when there's no data
ReactDOM.render(<Inactive />, document.getElementById('root'))

// :: Events
// https://github.com/RainbowMage/OverlayPlugin/wiki/JavaScript-API-reference
// https://github.com/hibiyasleep/OverlayPlugin/wiki/Additional-Javascript-API-Reference

// - onOverlayDataUpdate
// This event occurs when the OverlayPlugin sends the new data.
document.addEventListener('onOverlayDataUpdate', onOverlayDataUpdate)

// - onLogLine
// This event occurs when anything in the chat happens, so we need to clean it up a bit before sending to the component or else it will polute and re-render it a lot unnecessarily
// Not being implemented right now
// document.addEventListener('onLogLine', onOverlayDataUpdate)

// - onOverlayStateUpdate
// This event occurs when the overlay setting has changed.
document.addEventListener('onOverlayStateUpdate', function(e) {
  if (!e.detail.isLocked) {
    document.documentElement.classList.add('resizable')
  } else {
    document.documentElement.classList.remove('resizable')
  }
})
// Receiver of OverlayPluginApi.sendMessage and OverlayPluginApi.broadcastMessage, not being used as far as I know
window.addEventListener('message', function(e) {
  if (e.data.type === 'onOverlayDataUpdate') {
    onOverlayDataUpdate(e.data)
  }
})


// 新的监听方式
// OverlayAPI.
const overlay = new OverlayAPI({
  extendData: true,
  silentMode: false,
});

overlay.addListener('CombatData', (data) => {
  console.log('listener of `CombatData`', data);
});
overlay.addListener('ChangeZone', (data) => {
  console.log('listener of `ChangeZone`', data);
});
overlay.addListener('OnlineStatusChanged', (data) =>{
  console.log('listener of `OnlineStatusChanged`', data);
  if (data.status === 'InCutscene') {
    // 过场动画中
  } else {
    // 离开过场动画
  }
})

overlay.startEvent();
