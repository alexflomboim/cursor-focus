# cursor-focus

> React cursor focus library

[![NPM](https://img.shields.io/npm/v/cursor-focus.svg)](https://www.npmjs.com/package/cursor-focus) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save cursor-focus
```

## Usage

```jsx
import React, { Component } from 'react'

import MyComponent from 'cursor-focus'
import 'cursor-focus/dist/index.css'

class Example extends Component {
  render() {
    return <MyComponent />
  }
}
```
Для работы неободимо:

1. Унаследовать класс **StoreFocusBase** и в базовый конструктор передать массив констант-идентификаторов фокусных слоев. Например:
```jsx
class StoreFocus extends StoreFocusBase{

    constructor() {
        super([FOCUS_LAYER__MENU, FOCUS_LAYER__GAME, FOCUS_LAYER__KBOARD]);
    }
...
```
2. Все фокусабльные элементы выделить в отдельные классовые компоненты, и обернуть их в HOC focusable:
```jsx
const Field = focusable(observer(class Field extends React.Component {
    constructor(props) {
        super(props);


```
3. Для управления фокусом кнопками курсора - необходимо вызывать функцию moveFocus вашего классан-наследника от StoreFocusBase передавая в него параметром - направление переода: 0 - вверх, 1 - вправо, 2 - вниз, 3 - влево
```jsx
document.addEventListener('keydown', function(e){
    if(e.code === 'ArrowUp')        StoreFocus.moveFocus(0);
    if(e.code === 'ArrowRight')     StoreFocus.moveFocus(1);
    if(e.code === 'ArrowDown')      StoreFocus.moveFocus(2);
    if(e.code === 'ArrowLeft')      StoreFocus.moveFocus(3);

  });
```

## License

MIT © [alexflomboim](https://github.com/alexflomboim)
