import * as React from 'react';
import Cart from '../../components/Cart/Cart.js';
import Menu from '../../components/Menu/Menu.js';
import { Provider as CartProvider } from '../Cart/CartStateProvider.js';
import { Provider as MenuProvider } from '../Menu/MenuStateProvider.js';
import styles from './App.module.css';
export default function App() {
  return /*#__PURE__*/React.createElement(MenuProvider, null, /*#__PURE__*/React.createElement(CartProvider, null, /*#__PURE__*/React.createElement("main", {
    className: styles.app
  }, /*#__PURE__*/React.createElement(Menu, null), /*#__PURE__*/React.createElement(Cart, null))));
}