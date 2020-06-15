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

    return (
      <div style={this.props.pos} className={"btn " + (this.props.focused ? " focused" : "")} onClick={() => this.onClick()}></div>
    );
  }
})

export default TestComponent;
