import { StoreFocusBase } from 'cursor-focus'


class StoreFocus extends StoreFocusBase{

    constructor() {
        super([1]);
    }


    /**
     * Здесь можно определить действия при клике на стрелку, когда в текущем слое нет подходящих кандидатов
     * @param direction
     */
    emptyFocusDirectionAction(direction) {
        console.log('emptyFocusDirectionAction');


    }
}

export default new StoreFocus();
