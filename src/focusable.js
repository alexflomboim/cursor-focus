import React from "react";
import ReactDOM from 'react-dom';

function focusable (WrappedComponent, Store, focusLayers = null) {
  class Focusable extends React.Component {
    constructor(props) {
      super(props);

      this.componentRef = React.createRef();
      this.domRef = null;

      this.focusLayers = [];

      //если фокусные слои не переданы - добавляем объект в ВСЕ фокусные слои
      if(focusLayers === null)    Object.keys(Store.focusLayers).map(fl => this.focusLayers.push(fl));
      else                        focusLayers.map(fl => this.focusLayers.push(fl));



      this.state = {
        focused: false,
      };
    }

    onMouseEnter() {
      let ok = false;
      for(let i=0;i<this.focusLayers.length;i++) {
        if(Store.currentFocusLayer === this.focusLayers[i]) {
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
      for(let i=0;i<this.focusLayers.length;i++)   Store.addToFocusLayer(this.focusLayers[i], component);

      //назначем обработчик мыши
      this.componentRef.current.getDomRef().addEventListener('mouseover', () => this.onMouseEnter());
    }

    componentWillUnmount() {
      for(let i=0;i<this.focusLayers.length;i++) {
        Store.removeFromFocusLayer(this.focusLayers[i], this.componentRef.current);
      }

      this.componentRef.current.getDomRef().removeEventListener('mouseover', () => this.onMouseEnter());
    }

    render() {
      return <WrappedComponent ref={this.componentRef} {...this.props} focused={this.state.focused}/>;
    }
  }

  return Focusable;
}

export default focusable;
