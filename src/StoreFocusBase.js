

export const FOCUS_LAYER_DEFAULT_FOCUS = {
  DEFAULT: 0,
  SAVED: 1
};


export class StoreFocusBase {

  /**
   * Передаем массив констант, каждая из которых определяет фокусный слой
   * @param fLayers
   */
  constructor(fLayers = null) {

    this.focusLayers = {}; // объект массивов - здесь содержаться фокусабельные объекты, входщие в каждый слов
    this.currentFocusLayer = null; // активный фокусный слов
    this.currentFocused = null; // активный зафокушенный объект
    this.focusEnabled = true; // флаг активности фокуса вообще, если false - движения мыши или курсора не будут фокусить объекты
    this.lastLayersFocuses = {}; // для каждого слоя здесь храним последний зафокушенный объект, для фокусировки его при возврате к слою
    this.FOCUS_MIN_ANGLE_FOR_DISTANCE = Math.PI / 18;

    //если не переданы фокусные слои - создаем один, который будет дефолтовым и активным
    if(fLayers === null) {
      let defaultLayerKey = "default";
      this.focusLayers[defaultLayerKey] = [];
      this.setFocusLayer(defaultLayerKey);
    } else
      fLayers.map(fl => this.focusLayers[fl] = []);


  }

  /**
   * находим среди кандидатов слоя - такой, который определен как фокусируемым по-умолчанию.
   * Либо возвращаем null
   * @returns {null}
   * @private
   */
  _findDefaultFocused() {
    let defaultFocused = null;

    this.focusLayers[this.currentFocusLayer].map(e => {
      if(e.focusable() && e.defaultFocused())
        defaultFocused = e;
    })

    return defaultFocused;
  }

  //Используются для глобального включение-отключения фокуса, например во время обработки запроса
  disableFocus() {this.focusEnabled = false;}
  enableFocus() {this.focusEnabled = true;}

  /**
   * Используется из обработчика мыши в focusable-компоненте. Предназначена для установки фокуса на конкретный компонент
   * @param component
   */
  setCurrentFocusedByComponent(component) {
    let focusLayer = this.focusLayers[this.currentFocusLayer];
    for(let i=0;i<focusLayer.length;i++) {
      if(focusLayer[i] === component) {
        this.setCurrentFocused(focusLayer[i]);
        return;
      }
    }
  }

  setCurrentFocused(el) {
    //снимаем фокус с предыдущего
    if(this.currentFocused !== null)    this.currentFocused.setUnFocused();

    // если передан null - это дефолтовая фокусировка после смены фокусного слоя.
    // Находим компонент, обозначенный как дефолтовый для фокуса в этом слое и фокусим его
    if(el === null) el = this._findDefaultFocused();

    //меняем элемент
    this.currentFocused = el;
    //запоминаем элемент в историю
    this.lastLayersFocuses[this.currentFocusLayer] = el;
    //фокусим новый элемент
    if(this.currentFocused !== null)    this.currentFocused.setFocused();
  }

  /**
   * Возвращает последний фокушенный элемент в указанном слое.
   * @param layer
   * @returns {null}
   */
  getLayerFocused(layer) {
    let t = this.lastLayersFocuses[layer];
    if(typeof t === "undefined") return null;
    return t;
  }

  /**
   * Добавляет компонент в указанный слой. Используется в componentDidMount focusable HOC
   * @param focusLayer
   * @param obj
   */
  addToFocusLayer(focusLayer, component) {
    this.focusLayers[focusLayer].push(component);
  }

  /**
   * Удаляет компонент из указанного слоя. Используется в componentWillUnmount focusable HOC
   * @param focusLayer
   * @param component
   */
  removeFromFocusLayer(focusLayer, component) {
    //Если удаляется текущий зафокушенный - сбрасываем фокус
    if(this.currentFocused === component) {
      this.setCurrentFocused(null);
    }

    //Удаляем этот компонент из всех слоев
    for(let i=0;i<this.focusLayers[focusLayer].length;i++) {
      if(this.focusLayers[focusLayer][i] === component) {
        this.focusLayers[focusLayer].splice(i, 1);
      }
    }
  }

  /**
   * В зависимости от направления - находит наилучший компонент для фокуса и фокусит его. Если компонент не найден -
   * вызывает опциональную функцию для переходов между слоями
   * @param direction
   */
  moveFocus(direction) {

    if(!this.focusEnabled) return;

    // берем все компоненты из текущего фокусного слоя
    let components = this.focusLayers[this.currentFocusLayer];

    let found = {
      candidate: null
    };

    let currentFocusedX = 0,
      currentFocusedY = 0;
    if(this.currentFocused !== null && this.currentFocused !== null) {
      let rect = this.currentFocused.getDomRef().getBoundingClientRect();
      currentFocusedX = Math.floor(rect.left + (rect.right - rect.left) * 0.5);
      currentFocusedY = Math.floor(rect.top + (rect.bottom - rect.top) * 0.5);
    }

    // проходим по всем кандидатам
    components.map(c => {

      if(!c.focusable())    return;

      // рассчитываем центр кандидата и расстояние от центра текущего фокуса до центра кандидата
      let rect = c.getDomRef().getBoundingClientRect();
      c.x = Math.floor(rect.left + (rect.right - rect.left) * 0.5);
      c.y = Math.floor(rect.top + (rect.bottom - rect.top) * 0.5);
      let dx = c.x - currentFocusedX, dy = c.y - currentFocusedY;
      c.distance = Math.sqrt(dx*dx + dy*dy);

      let store = this;
      function check() {

        let flag = false;
        if(found.candidate === null) {
          flag = true;
          //console.log('c1');
        }
        else {
          if(Math.abs(c.acos-found.candidate.acos) < store.FOCUS_MIN_ANGLE_FOR_DISTANCE) {
            if (c.distance < found.candidate.distance) {
              flag = true;
              //console.log('c2');
            }
          } else {
            if( c.cos > found.candidate.cos && c.distance < 2*found.candidate.distance) {
              flag = true;
              //console.log('c3');
            } else if( c.cos < found.candidate.cos && c.distance < 0.5*found.candidate.distance) {
              flag = true;
              //console.log('c4');
            }
          }
        }

        if(flag) {
          /*console.log(c, found.candidate);
          console.log('OK', c.obj.node);*/
          found.candidate = c;
        }

      }

      if(direction === 0) {
        if(c.y < currentFocusedY) {
          c.cos = Math.abs((c.y-currentFocusedY) / c.distance);
          c.acos = Math.acos(c.cos);
          check();
        }
      } else if(direction === 1) {
        if(c.x > currentFocusedX) {
          c.cos = Math.abs((c.x-currentFocusedX) / c.distance);
          c.acos = Math.acos(c.cos);
          check();
        }
      } else if(direction === 2) {
        if(c.y > currentFocusedY) {
          c.cos = Math.abs((c.y-currentFocusedY) / c.distance);
          c.acos = Math.acos(c.cos);
          check();
        }
      } else if(direction === 3) {
        if(c.x < currentFocusedX) {
          c.cos = Math.abs((c.x-currentFocusedX) / c.distance);
          c.acos = Math.acos(c.cos);
          check();
        }
      }

    });

    if(found.candidate !== null) {
      this.setCurrentFocused(found.candidate);
    } else {
      // Если не найден подходящий для перехода фокуса узел -
      // здесь вызывается фнукия, которая может быть определена в классе-наслединке
      // В ней можно определить поведение в таких ситуациях
      if(typeof this.emptyFocusDirectionAction === "function")
        this.emptyFocusDirectionAction(direction);
    }
  }

  /**
   * Устанавливает новый активный слой. Второй параметр определяет, какой фокусный элемент этого слоя будет зафокушен по-умолчанию:
   * дефолтовый или последний зафокушенный
   * @param newValue
   * @param defaultFocus
   */
  setFocusLayer(newValue = null, defaultFocus = FOCUS_LAYER_DEFAULT_FOCUS.DEFAULT) {
    console.log('setFocusLayer ', newValue);

    this.currentFocusLayer = newValue;

    if (defaultFocus === FOCUS_LAYER_DEFAULT_FOCUS.SAVED) {
      this.setCurrentFocused(this.getLayerFocused(this.currentFocusLayer));
    } else if (defaultFocus === FOCUS_LAYER_DEFAULT_FOCUS.DEFAULT) {
      this.setCurrentFocused(null);
    }
  }


}

