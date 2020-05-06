import React from "react";
import StoreFocus from './StoreFocus'
import {focusable} from 'cursor-focus'

const TestComponent = focusable(class TestComponent extends React.Component {
  constructor(props) {
    super(props);

  }

  onClick() {
    console.log('click');
  }

  defaultFocused() {
    return true;
  }

  render() {
    console.log('render MenuButton');

    return (
      <div className={"btn " + (this.props.focused ? " focused" : "")} onClick={() => this.onClick()}></div>
    );
  }
}, StoreFocus)

export default TestComponent;
