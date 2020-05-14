import React from 'react'

import { ExampleComponent } from 'cursor-focus'
import './index.css'
import TestComponent from './TestComponent'
import StoreFocus from './StoreFocus'
import { MOVE_FOCUS_DIRECTION } from 'cursor-focus'

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    let evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const App = () => {
  document.addEventListener('keydown', function(e){
    if(e.code === 'ArrowUp')        StoreFocus.moveFocus(MOVE_FOCUS_DIRECTION.UP);
    if(e.code === 'ArrowRight')     StoreFocus.moveFocus(MOVE_FOCUS_DIRECTION.RIGHT);
    if(e.code === 'ArrowDown')      StoreFocus.moveFocus(MOVE_FOCUS_DIRECTION.DOWN);
    if(e.code === 'ArrowLeft')      StoreFocus.moveFocus(MOVE_FOCUS_DIRECTION.LEFT);
    if(e.code === 'Enter')          StoreFocus.click();
  });

  let items = [], n=15;
  for(let i=0;i<n;i++) {
    items.push(<TestComponent pos={{left: getRandomInt(1280), top: getRandomInt(720)}}/>);
  }

  /*items.push(<TestComponent pos={{left: 500, top: 500}}/>);
  items.push(<TestComponent pos={{left: 900, top: 500}}/>);
  items.push(<TestComponent pos={{left: 700, top: 400}}/>);*/

  return <div>
    {items}
  </div>
}

export default App
