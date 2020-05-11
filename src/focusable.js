import React from "react";
import ReactDOM from 'react-dom';

function focusable (WrappedComponent, store, focusLayers = null) {
  class Focusable extends React.Component {
    constructor(props) {
      super(props);

      // реф на компонент, который непоредственно фокусится
      this.componentRef = React.createRef();
      // реф на дом-узел компонента, для алгоритма определения кандидатов для фокуса
      this.domRef = null;
      // слои, в которые входит данный компонент
      this.focusLayers = [];

      //если фокусные слои не переданы - добавляем объект в ВСЕ фокусные слои
      if(focusLayers === null)    Object.keys(store.focusLayers).map(fl => this.focusLayers.push(fl));
      else                        focusLayers.map(fl => this.focusLayers.push(fl));

      this.state = {
        focused: false,
      };
    }

    /**
     * обработчик наведения мышью
     */
    onMouseEnter = () => {
      let ok = false;
      // определяем, входит ли данный компонент в активный в данный момент фокусный слой
      for(let i=0;i<this.focusLayers.length;i++) {
        if(store.currentFocusLayer === this.focusLayers[i]) {
          ok = true;
          break;
        }
      }

      // текущий слой - среди слоев этого компонента
      if(!ok) return;

      // компонент знает, что не должен фокусится
      if(!this.componentRef.current.focusable())  return;

      // проверяем, включен ли сейчас фообще фокус
      if(!store.focusEnabled) return;

      store.setCurrentFocusedByComponent(this.componentRef.current);
    }

    componentDidMount() {


      let component = this.componentRef.current;

      // вытягиваем реф на дом-узел компонента и учим его слушать мышь
      this.domRef = ReactDOM.findDOMNode(component);
      this.domRef.addEventListener('mouseover', this.onMouseEnter)

      //эти методы могут быть переопределены в компонентах
      if(typeof component.focusable !== "function")       component.focusable = function() {return true}
      if(typeof component.defaultFocused !== "function")  component.defaultFocused = function() {return false}

      let obj = {
        component: component,
        setFocused: () => {this.setState({focused: true})},
        setUnFocused: () => {this.setState({focused: false})},
        getDomRef: () => {return this.domRef}
      }

      //добавляем компонент в соответствующие фокусные слои
      for(let i=0;i<this.focusLayers.length;i++)   store.addToFocusLayer(this.focusLayers[i], obj);

    }

    componentWillUnmount() {
      //удалем компонент из всех слоев
      for(let i=0;i<this.focusLayers.length;i++)
        store.removeFromFocusLayer(this.focusLayers[i], this.componentRef.current);

      // отвязываем обработчик мыши
      this.domRef.removeEventListener('mouseover', this.onMouseEnter);
    }

    render() {
      return <WrappedComponent ref={this.componentRef} {...this.props} focused={this.state.focused}/>;
    }
  }

  return Focusable;
}

export default focusable;
