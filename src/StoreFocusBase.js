

export const MOVE_FOCUS_DIRECTION = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3
};

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
    this.previousFocusLayer = null; // предыдущий фокусный слов
    this.currentFocused = null; // активный зафокушенный объект
    this.focusEnabled = true; // флаг активности фокуса вообще, если false - движения мыши или курсора не будут фокусить объекты
    this.lastLayersFocuses = {}; // для каждого слоя здесь храним последний зафокушенный объект, для фокусировки его при возврате к слою
    this.SEE_ANGLE_PRIORITY = Math.cos(120 / 180 * Math.PI);

    //если не переданы фокусные слои - создаем один, который будет дефолтовым и активным
    if(fLayers === null) {
      let defaultLayerKey = "default";
      this.focusLayers[defaultLayerKey] = [];
      this.setCurrentFocusLayer(defaultLayerKey);
    } else
      fLayers.forEach(fl => this.focusLayers[fl] = []);


  }



  //Используются для глобального включение-отключения фокуса, например во время обработки запроса
  disableFocus() {this.focusEnabled = false;}
  enableFocus() {this.focusEnabled = true;}

  /**
   * Функция используется для вызова клика на зафокушенном объекте
   */
  click() {
    if(this.currentFocused === null)  return ;

    let el = this.currentFocused.getDomRef();
    if (el.fireEvent) {
      el.fireEvent('onclick');
    } else {
      let evObj = document.createEvent('Events');
      evObj.initEvent('click', true, false);
      el.dispatchEvent(evObj);
    }
  }

  /**
   * В зависимости от направления - находит наилучший компонент для фокуса и фокусит его. Если компонент не найден -
   * вызывает опциональную функцию для переходов между слоями
   * @param direction
   * @returns {boolean} true - если новый элемент найден и назанчен, false - если не найден
   */
  moveFocus(direction) {

    if(!this.focusEnabled) return false;

    // берем все компоненты из текущего фокусного слоя
    let objects = this.focusLayers[this.currentFocusLayer];

    let bestCandidate = null;

    let currentFocusedCenter = {x: 0, y: 0};
    if(this.currentFocused !== null)  currentFocusedCenter = this.__getDomNodeCenter(this.currentFocused.getDomRef());

    // проходим по всем кандидатам
    objects.forEach(newCandidate => {

      if(!newCandidate.component.focusable())    return;

      // пропускаем, если этот кандидат - это текущий зафокушенный
      if(this.currentFocused !== null && this.currentFocused.getDomRef() === newCandidate.getDomRef()) return;

      // рассчитываем центр кандидата и расстояние от центра текущего фокуса до центра кандидата
      Object.assign(newCandidate, this.__getDomNodeCenter(newCandidate.getDomRef()));
      newCandidate.distance = this.__distance(newCandidate, currentFocusedCenter);


      // для кандидатов, которые находятся в нужной полуплоскости (остальных не рассматриваем) - вычисляем косинус угла
      // между вектором направления перехода фокуса и вектором, соединящим центр текущего фокусного элемента и центр кандидата
      let needCheckCandidate = false;
      if(direction === MOVE_FOCUS_DIRECTION.UP            && newCandidate.y < currentFocusedCenter.y) {
        newCandidate.cos = Math.abs((newCandidate.y-currentFocusedCenter.y) / newCandidate.distance);
        needCheckCandidate = true;
      } else if(direction === MOVE_FOCUS_DIRECTION.RIGHT  && newCandidate.x > currentFocusedCenter.x) {
        newCandidate.cos = Math.abs((newCandidate.x-currentFocusedCenter.x) / newCandidate.distance);
        needCheckCandidate = true;
      } else if(direction === MOVE_FOCUS_DIRECTION.DOWN   && newCandidate.y > currentFocusedCenter.y) {
        newCandidate.cos = Math.abs((newCandidate.y-currentFocusedCenter.y) / newCandidate.distance);
        needCheckCandidate = true;
      } else if(direction === MOVE_FOCUS_DIRECTION.LEFT   && newCandidate.x < currentFocusedCenter.x) {
        newCandidate.cos = Math.abs((newCandidate.x-currentFocusedCenter.x) / newCandidate.distance);
        needCheckCandidate = true;
      }

      // если кандидат в нужной полуплоскости - сравниваем его с текущим лучшим и если он лучше - он становится лучшим
      if(needCheckCandidate && this.__checkCandidate(currentFocusedCenter, bestCandidate, newCandidate))
        bestCandidate = newCandidate;
    });

    // если лучший кандидат найден - фокусим его
    if(bestCandidate !== null) {
      this._setCurrentFocused(bestCandidate);
      return true;
    }

    return false;
  }

  /**
   * Устанавливает новый активный слой. Второй параметр определяет, какой фокусный элемент этого слоя будет зафокушен по-умолчанию:
   * дефолтовый или последний зафокушенный
   * @param newValue
   * @param defaultFocus
   */
  setCurrentFocusLayer(newValue = null, defaultFocus = FOCUS_LAYER_DEFAULT_FOCUS.DEFAULT) {
    //если передан пустой слой - значит нужен переход на последний активный слой
    if(newValue === null && this.previousFocusLayer !== null) {
      let gotoLayer = this.previousFocusLayer;
      this.previousFocusLayer = null;
      this.setCurrentFocusLayer(gotoLayer, defaultFocus);
      return;
    }

    //сохраняем предыдущий фокусный слой
    this.previousFocusLayer = this.currentFocusLayer;

    this.currentFocusLayer = newValue;

    if (defaultFocus === FOCUS_LAYER_DEFAULT_FOCUS.SAVED) {
      this._setCurrentFocused(this._getLayerFocused(this.currentFocusLayer));
    } else if (defaultFocus === FOCUS_LAYER_DEFAULT_FOCUS.DEFAULT) {
      // Находим компонент, обозначенный как дефолтовый для фокуса в этом слое и фокусим его
      this._setCurrentFocused(this._findDefaultFocused());
    }
  }

  /**
   * Используется из обработчика мыши в focusable-компоненте. Предназначена для установки фокуса на конкретный компонент
   * @param component
   */
  setCurrentFocusedByComponent(component) {
    let focusLayer = this.focusLayers[this.currentFocusLayer];
    for(let i=0;i<focusLayer.length;i++) {
      if(focusLayer[i].component === component) {
        this._setCurrentFocused(focusLayer[i]);
        return;
      }
    }
  }

  _setCurrentFocused(obj) {
    // если это попытка установить повторно фокус на элемет, который и так под фокусом - выход
    if(this.currentFocused === obj) return;

    //снимаем фокус с предыдущего
    if(this.currentFocused !== null)    this.currentFocused.setUnFocused();

    //меняем элемент
    this.currentFocused = obj;
    //запоминаем элемент в историю
    this.lastLayersFocuses[this.currentFocusLayer] = obj;
    //фокусим новый элемент
    if(this.currentFocused !== null)    this.currentFocused.setFocused();
  }



  /**
   * Добавляет компонент в указанный слой. Используется в componentDidMount focusable HOC
   * @param focusLayer
   * @param obj
   */
  addToFocusLayer(focusLayer, obj) {
    this.focusLayers[focusLayer].push(obj);
  }

  /**
   * Удаляет компонент из указанного слоя. Используется в componentWillUnmount focusable HOC
   * @param focusLayer
   * @param component
   */
  removeFromFocusLayer(focusLayer, component) {
    //Если удаляется текущий зафокушенный - сбрасываем фокус
    if(this.currentFocused !== null && this.currentFocused.component === component) {
      this._setCurrentFocused(null);
    }

    //Удаляем этот компонент из всех слоев
    for(let i=0;i<this.focusLayers[focusLayer].length;i++) {
      if(this.focusLayers[focusLayer][i].component === component) {
        this.focusLayers[focusLayer].splice(i, 1);
      }
    }
  }

  /**
   * Возвращает последний фокушенный элемент в указанном слое.
   * @param layer
   * @returns {null}
   */
  _getLayerFocused(layer) {
    let t = this.lastLayersFocuses[layer];
    if(typeof t === "undefined") return null;
    return t;
  }

  /**
   * находим среди кандидатов слоя - такой, который определен как фокусируемым по-умолчанию.
   * Либо возвращаем null
   * @returns {null}
   * @private
   */
  _findDefaultFocused() {
    console.log('_findDefaultFocused');
    let defaultFocused = null;

    this.focusLayers[this.currentFocusLayer].forEach(e => {
      console.log('!!!');
      if(e.component.focusable() && e.component.defaultFocused())
        defaultFocused = e;
    })

    return defaultFocused;
  }

  /*__chooseNearestPoint(x, y, rect) {
      let centerX = Math.floor(rect.left + (rect.right - rect.left) * 0.5),
          centerY = Math.floor(rect.top + (rect.bottom - rect.top) * 0.5);

      let nearestCornerX = 0, nearestCornerY = 0;

      if(x <= centerX) {
          if(y <= centerY)  return {x: rect.left, y: rect.top, corner: 0};
          else              return {x: rect.left, y: rect.bottom, corner: 3};
      }
      else {
          if(y <= centerY)  return {x: rect.right, y: rect.top, corner: 1};
          else              return {x: rect.right, y: rect.bottom, corner: 2};
      }
  }*/

  /**
   * Скалярное произведение 2х векторов
   * @param v1
   * @param v2
   * @returns {number}
   * @private
   */
  __scalarMult(v1, v2) {return v1.x*v2.x + v1.y*v2.y}

  /**
   * v1 - v2
   * @param v1
   * @param v2
   * @returns {{x: number, y: number}}
   * @private
   */
  __vectorMinus(v1, v2) {return {x: v1.x-v2.x, y: v1.y-v2.y}}

  /**
   * Нахождение
   * @param v1
   * @param v2
   * @returns {number}
   * @private
   */
  __cosA(v1, v2) {
    let dist1 = Math.sqrt(v1.x*v1.x + v1.y*v1.y),
      dist2 = Math.sqrt(v2.x*v2.x + v2.y*v2.y);

    if(dist1 === 0 || dist2 === 0)  return 0;

    return this.__scalarMult(v1, v2) / dist1 / dist2;
  }

  /**
   * Расстояние между двумя точками
   * @param v1
   * @param v2
   * @returns {number}
   * @private
   */
  __distance(v1, v2) {
    let dx = v1.x - v2.x,
      dy = v1.y - v2.y;
    return Math.sqrt(dx*dx + dy*dy);
  }

  /**
   * Поиск косинуса в точке abc
   * @param a
   * @param b
   * @param c
   * @returns {number}
   * @private
   */
  __get3pointsAngleCos(a, b, c) {
    let a1 = this.__vectorMinus(a, b),
      c1 = this.__vectorMinus(c, b);

    return this.__cosA(a1, c1);
  }

  /**
   * Возвращает центр дом элемента по рефу
   * @param ref
   * @returns {{x: number, y: number}}
   * @private
   */
  __getDomNodeCenter(ref) {
    let rect = ref.getBoundingClientRect();
    return {
      x: Math.floor(rect.left + (rect.right - rect.left) * 0.5),
      y: Math.floor(rect.top + (rect.bottom - rect.top) * 0.5)
    };
  }

  /**
   * Сравниваем кандидата и текущего лучшего кандидата,
   * возвращаем true если новый кандидат лучше
   *
   * Выигрывает:
   *  - тот, кто лучше и по углу (угол к направлению фокуса меньший, т.е. косинус больший) и по расстоянию
   *  - если лучше только по одному из 2х критериев то:
   *  - - строим треугольгик ABC где A - центр текущего фокуса, B - центр худшего по углу из двух сравниваемых, C - центр
   *  лучшего по углу из двух.
   *  - - рассчитываем угол ABC треугольника
   *  - - если угол более SEE_ANGLE_PRIORITY (120) - выигрывает худший по углу
   *  - - иначе (угол менее SEE_ANGLE_PRIORITY) - выигрывает лучший по углу
   * @param currentFocusedCenter
   * @param bestCandidate
   * @param newCandidate
   * @returns {boolean}
   * @private
   */
  __checkCandidate(currentFocusedCenter, bestCandidate, newCandidate) {

    // когда это нету текущего лучшего - новый кандидат становится лучшим
    if(bestCandidate === null) return true;

    if(newCandidate.cos >= bestCandidate.cos) {
      if(newCandidate.distance < bestCandidate.distance) return true;
      else {
        if(this.__get3pointsAngleCos(currentFocusedCenter, bestCandidate, newCandidate) < this.SEE_ANGLE_PRIORITY) return false;
        return true;
      }
    } else {
      if(newCandidate.distance > bestCandidate.distance) return false;
      else {
        if(this.__get3pointsAngleCos(currentFocusedCenter, newCandidate, bestCandidate) < this.SEE_ANGLE_PRIORITY) return true;
        return false;
      }
    }
  }



}

