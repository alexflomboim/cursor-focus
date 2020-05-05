import React from 'react'
import ReactDOM from 'react-dom'

module.exports = function focusable(WrappedComponent, focusLayers, Store) {
  class Focusable extends React.Component {
    constructor(props) {
      super(props);

      this.componentRef = React.createRef();
      this.domRef = null;

      this.state = {
        focused: false,

      };
    }

    onMouseEnter() {
      let ok = false;
      for(let i=0;i<focusLayers.length;i++) {
        if(Store.currentFocusLayer === focusLayers[i]) {
          ok = true;
          break;
        }
      }

      if(!ok) return;
      if(!Store.focusEnabled) return;

      Store.setCurrentFocusedByComponent(this.componentRef.current);
    }

    componentDidMount() {
      // ------ Дополняем компонент необходимым методами -------
      this.domRef = ReactDOM.findDOMNode(this.componentRef.current);

      let component = this.componentRef.current;
      Object.assign(component, {
        setFocused: () => {this.setState({focused: true})},
        setUnFocused: () => {this.setState({focused: false})},
        getDomRef: () => {return this.domRef}
      });

      //эти методы могут быть переопределены в компонентах
      if(typeof component.focusable !== "function")       component.focusable = function() {return true}
      if(typeof component.defaultFocused !== "function")  component.defaultFocused = function() {return false}

      //добавляем компонент в соответствующие фокусные слои
      for(let i=0;i<focusLayers.length;i++)   Store.addToFocusLayer(focusLayers[i], component);

      //назначем обработчик мыши
      this.componentRef.current.getDomRef().addEventListener('mouseover', () => this.onMouseEnter());
    }

    componentWillUnmount() {
      for(let i=0;i<focusLayers.length;i++) {
        Store.removeFromFocusLayer(focusLayers[i], this.componentRef.current);
      }

      this.componentRef.current.getDomRef().removeEventListener('mouseover', () => this.onMouseEnter());
    }

    render() {
      return <WrappedComponent ref={this.componentRef} {...this.props} focused={this.state.focused}/>;
    }
  }

  return Focusable;
}
