import {extendObservable} from "mobx";


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
    extendObservable(this, {
      focusLayers: {}, // объект массивов - здесь содержаться фокусабельные объекты, входщие в каждый слов
      currentFocusLayer: null, // активный фокусный слов
      currentFocused: null, // активный зафокушенный объект
      focusEnabled: true, // флаг активности фокуса вообще, если false - движения мыши или курсора не будут фокусить объекты
      lastLayersFocuses: {}, // для каждого слоя здесь храним последний зафокушенный объект, для фокусировки его при возврате к слою
    });


    //если не переданы фокусные слои - создаем один, который будет дефолтовым и активным
    if(fLayers === null) {
      let defaultLayerKey = "default";
      this.focusLayers[defaultLayerKey] = [];
      this.setFocusLayer(defaultLayerKey);
    } else
      fLayers.map(fl => this.focusLayers[fl] = []);

    this.FOCUS_MIN_ANGLE_FOR_DISTANCE = Math.PI / 18;
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

    if(el === null)
      el = this._findDefaultFocused();

    //меняем элемент
    this.currentFocused = el;
    //запоминаем элемент в историю
    this.lastLayersFocuses[this.currentFocusLayer] = el;
    //фокусим новый элемент
    if(this.currentFocused !== null)    this.currentFocused.setFocused();
  }

  getLayerFocused(layer) {
    let t = this.lastLayersFocuses[layer];
    if(typeof t === "undefined") return null;
    return t;
  }

  addToFocusLayer(focusLayer, obj) {
    this.focusLayers[focusLayer].push(obj);
  }

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

  moveFocus(direction) {

    if(!this.focusEnabled) return;

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

    components.map(c => {

      if(!c.focusable())    return;

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
      this.emptyFocusDirectionAction(direction);
    }
  }

  setFocusLayer(newValue = null, defaultFocus = FOCUS_LAYER_DEFAULT_FOCUS.DEFAULT) {
    console.log('setFocusLayer ', newValue);

    this.currentFocusLayer = newValue;

    //при фокусировке после переключения слоя - делаем небольшую задержку чтобы сфокусировать внимание юзера
    setTimeout(() => {
      if (defaultFocus === FOCUS_LAYER_DEFAULT_FOCUS.SAVED) {
        this.setCurrentFocused(this.getLayerFocused(this.currentFocusLayer));
      } else if (defaultFocus === FOCUS_LAYER_DEFAULT_FOCUS.DEFAULT) {
        this.setCurrentFocused(null);
        //this.moveFocus(2);
      }
    }, 500);
  }


}

