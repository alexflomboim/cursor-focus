import React from "react";
import ReactDOM from 'react-dom';
import {extendObservable} from "mobx";



export const FOCUS_LAYER_DEFAULT_FOCUS = {
  DEFAULT: 0,
  SAVED: 1
};

export {default as focusable} from './focusable';
export {default as StoreFocusBase} from './StoreFocusBase';
