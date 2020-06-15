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
    return !!this.props.defaultFocused;
  }

  render() {

    let className = 'btn';

    if(this.props.focused)  className += ' focused';
    if(this.props.defaultFocused)  className += ' default-focused';

    return (
      <div style={this.props.pos} className={className} onClick={() => this.onClick()}></div>
    );
  }
})

export default TestComponent;
