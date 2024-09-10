import * as React from 'react';
import { formatDollars } from '../../utils.js';
import { useCartState } from '../Cart/CartStateProvider.js';
import AddToCartCTA from './AddToCartCTA.js';
import styles from './MenuItem.module.css';
export default function MenuItem({
  item
}) {
  const {
    imageUrl,
    title,
    price
  } = item;
  const {
    hasItemById
  } = useCartState();
  const inCart = hasItemById(item.id);
  return /*#__PURE__*/React.createElement("li", {
    className: styles.item
  }, /*#__PURE__*/React.createElement("img", {
    src: imageUrl,
    className: styles.itemImg,
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: styles.content
  }, /*#__PURE__*/React.createElement("h2", {
    className: styles.title
  }, title), /*#__PURE__*/React.createElement("p", {
    className: styles.price
  }, formatDollars(price)), /*#__PURE__*/React.createElement(AddToCartCTA, {
    inCart: inCart,
    item: item
  })));
}