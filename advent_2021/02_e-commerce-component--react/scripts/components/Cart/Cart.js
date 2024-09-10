import * as React from 'react';
import cardStyles from '../Card/Card.module.css';
import styles from './Cart.module.css';
import CartItem from './CartItem.js';
import { useCartState } from './CartStateProvider.js';
import CartTotals from './CartTotals.js';
export default function Cart() {
  const {
    cart
  } = useCartState();
  return /*#__PURE__*/React.createElement("section", {
    className: `${styles.cart} ${cardStyles.card}`
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h1", {
    className: cardStyles.title
  }, "Your Cart")), /*#__PURE__*/React.createElement("ul", {
    className: styles.list
  }, cart.map(item => /*#__PURE__*/React.createElement(CartItem, {
    key: item.id,
    item: item
  }))), /*#__PURE__*/React.createElement(CartTotals, null));
}