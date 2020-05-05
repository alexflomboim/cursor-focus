import React from 'react'

import { ExampleComponent } from 'cursor-focus'
import 'cursor-focus/dist/index.css'
import TestComponent from './TestComponent'
import StoreFocus from './StoreFocus'

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    let evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

const App = () => {
  document.addEventListener('keydown', function(e){
    if(e.code === 'ArrowUp')        StoreFocus.moveFocus(0);
    if(e.code === 'ArrowRight')     StoreFocus.moveFocus(1);
    if(e.code === 'ArrowDown')      StoreFocus.moveFocus(2);
    if(e.code === 'ArrowLeft')      StoreFocus.moveFocus(3);
    if(e.code === 'Enter' && StoreFocus.currentFocused !== null) {
      eventFire(StoreFocus.currentFocused.getDomRef(), 'click');
    }
  });

  StoreFocus.setFocusLayer(1);

  return <div>
    <TestComponent/>
    <TestComponent/>
  </div>
}

export default App
