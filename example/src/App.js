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
    let moved = true;
    if(e.code === 'ArrowUp')        moved = StoreFocus.moveFocus(MOVE_FOCUS_DIRECTION.UP);
    if(e.code === 'ArrowRight')     moved = StoreFocus.moveFocus(MOVE_FOCUS_DIRECTION.RIGHT);
    if(e.code === 'ArrowDown')      moved = StoreFocus.moveFocus(MOVE_FOCUS_DIRECTION.DOWN);
    if(e.code === 'ArrowLeft')      moved = StoreFocus.moveFocus(MOVE_FOCUS_DIRECTION.LEFT);
    if(e.code === 'Enter')          StoreFocus.click();

    if(!moved) {
      if(StoreFocus.currentFocusLayer === 0 && e.code === 'ArrowRight') StoreFocus.setFocusLayer(1);
      if(StoreFocus.currentFocusLayer === 1 && e.code === 'ArrowDown')  StoreFocus.setFocusLayer(2);
      if(StoreFocus.currentFocusLayer === 2 && e.code === 'ArrowLeft')  StoreFocus.setFocusLayer(3);
      if(StoreFocus.currentFocusLayer === 3 && e.code === 'ArrowUp')    StoreFocus.setFocusLayer(0);
    }
  });

  let items = [[],[],[],[]], n=15;
  let sectorW = 400, sectorH = 300, padding = 30;
  for(let i=0;i<n;i++) {
    items[0].push(<TestComponent focusLayers={[0]} focusStore={StoreFocus} pos={{left: padding+getRandomInt(sectorW-2*padding), top: padding+getRandomInt(sectorH-2*padding)}}/>);
    items[1].push(<TestComponent focusLayers={[1]} focusStore={StoreFocus} pos={{left: padding+sectorW+getRandomInt(sectorW-2*padding), top: padding+getRandomInt(sectorH-2*padding)}}/>);
    items[2].push(<TestComponent focusLayers={[2]} focusStore={StoreFocus} pos={{left: padding+sectorW+getRandomInt(sectorW-2*padding), top: padding+sectorH+getRandomInt(sectorH-2*padding)}}/>);
    items[3].push(<TestComponent focusLayers={[3]} focusStore={StoreFocus} pos={{left: padding+getRandomInt(sectorW-2*padding), top: padding+sectorH+getRandomInt(sectorH-2*padding)}}/>);
  }

  StoreFocus.setFocusLayer(0);

  /*items.push(<TestComponent pos={{left: 500, top: 500}}/>);
  items.push(<TestComponent pos={{left: 900, top: 500}}/>);
  items.push(<TestComponent pos={{left: 700, top: 400}}/>);*/

  return (
    <div>
      <div className="layers">
        <div className="layer layer-0-0">
          {items[0]}
        </div>
        <div className="layer layer-0-1">
          {items[1]}
        </div>
        <div className="layer layer-1-0">
          {items[2]}
        </div>
        <div className="layer layer-1-1">
          {items[3]}
        </div>
      </div>
      <div className="log">
        sdfsdf

      </div>

      {/*{items}*/}
    </div>
  )
}

export default App
