import React from "react";
import ReactDOM from 'react-dom';

function focusable (WrappedComponent, Store, focusLayers = null) {
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
      if(focusLayers === null)    Object.keys(Store.focusLayers).map(fl => this.focusLayers.push(fl));
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
        if(Store.currentFocusLayer === this.focusLayers[i]) {
          ok = true;
          break;
        }
      }

      if(!ok) return;

      // проверяем, включен ли сейчас фообще фокус
      if(!Store.focusEnabled) return;

      Store.setCurrentFocusedByComponent(this.componentRef.current);
    }

    componentDidMount() {
      // вытягиваем реф на дом-узел компонента
      this.domRef = ReactDOM.findDOMNode(this.componentRef.current);

      // Дополняем компонент необходимым методами
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
      this.componentRef.current.getDomRef().addEventListener('mouseover', this.onMouseEnter);
    }

    componentWillUnmount() {
      //удалем компонент из всех слоев
      for(let i=0;i<this.focusLayers.length;i++)
        Store.removeFromFocusLayer(this.focusLayers[i], this.componentRef.current);

      // отвязываем обработчик мыши
      this.componentRef.current.getDomRef().removeEventListener('mouseover', this.onMouseEnter);
    }

    render() {
      return <WrappedComponent ref={this.componentRef} {...this.props} focused={this.state.focused}/>;
    }
  }

  return Focusable;
}

export default focusable;
