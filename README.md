# cursor-focus

> React cursor focus library

[![NPM](https://img.shields.io/npm/v/cursor-focus.svg)](https://www.npmjs.com/package/cursor-focus) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save cursor-focus
```

## Использование

Для работы неободимо:

### 1. Создать в проекте класс-наследник от **StoreFocusBase**
```jsx
class StoreFocus extends StoreFocusBase{

    constructor() {
        super();
    }
...

```
Базовый класс-стор содержит логику принятия решения о передаче фокуса, информацию о фокусных слоях и всю сопутствующую механику.

В наследнике можно переопределять некоторую механику поведения, о которой идет речь ниже.

### 2. Все фокусабльные элементы выделить в отдельные классовые компоненты, и обернуть их в HOC focusable:
```jsx
const Field = focusable(observer(class Field extends React.Component {
    constructor(props) {
        super(props);


```
Этот HOC имплементирует в компоент логик его фокусабельности. Признак присутствия фокуса передаются в компоенент через **props.focused** (true/false)

### 3. Реализовать реакцию на курсор
Для управления фокусом кнопками курсора - необходимо вызывать функцию moveFocus вашего классан-наследника от StoreFocusBase передавая в него параметром - направление переода: 0 - вверх, 1 - вправо, 2 - вниз, 3 - влево
```jsx
document.addEventListener('keydown', function(e){
    if(e.code === 'ArrowUp')        StoreFocus.moveFocus(0);
    if(e.code === 'ArrowRight')     StoreFocus.moveFocus(1);
    if(e.code === 'ArrowDown')      StoreFocus.moveFocus(2);
    if(e.code === 'ArrowLeft')      StoreFocus.moveFocus(3);

  });
```

Поддержка мыши реализована автоматически

### Расширенные возможности

#### Данамическая фокусабельность компонентов

Компоненты могу быть фокусабельными не всегда. Например, какая-то кнопка по логике приолжения присутствует в UI но недоступна для нажатия.

В этом случае в соотвествующем focusable-компоненте необходимо определить фунуцию **focusable()** и возвращать в ней true или false в зависимости от ситуации. На основе этого флага библиотека будет или не будет рассматривать этот компонент как доступый к фокусу при очередном клике

#### Фокус по-умолчанию

При необходимости, можно определить компонент, как такой, который должен быть автоматически зафокушен при переключении на слой, в котором он находится. Для этого необходимо определить в компоненте функцию **defaultFocused()** в которой вернуть true. При переходе на слой, в который включен такой элемент - он получит фокус.

В случае, если таких элементов одновременно будет несколько - фокус получит последний.

#### Слои

Иногда возникает необходимость блокировать фокусабельность некоторых элементов на время, при том что они остаются видимыми на экране. Например поверх основного UI нужно показать попап или боковое меню, отдав фокус в этот элемент.

Для этого в библиотеке предусмотрены слои. Для использования слоев необходимо:
1. в конструктор вашего наследника от **StoreFocusBase** передать массив констант-идентификаторов слоев
2. в HOC focusable, который оборачивает ваш фокусабельный объект - передать третьим опционалным параметром массив индентификаторов слоев, в который этот объект входит
3. управлять слоями, устанавливая текущий активный слой вызовом функции **setFocusLayer(key)** вашего наследника от **StoreFocusBase**, передавая в нее идентификатор желаемого слоя

### Автоматический уход со слоя

Например, поверх основного UI слева выехало меню, и вы отдали фокус в него. Клики вверх-вниз по меню - перемещают фокус по элементам меню. Может возникнуть желание скрывать меню, при клике вправо с любого пункта меню.

Это можно реализовать посредством переопределения функции **emptyFocusDirectionAction(direction)** в вашем наследнике от StoreFocusBase. Она будет вызвана в ситуации, когда на текущем слое не нашлось ни одного узла, для передачи фокуса, при клике в указанном направлении.



## License

MIT © [alexflomboim](https://github.com/alexflomboim)
