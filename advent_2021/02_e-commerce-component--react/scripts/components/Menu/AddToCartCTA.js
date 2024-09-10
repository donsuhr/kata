import * as React from 'react';
import { useCartState, ACTIONS } from '../Cart/CartStateProvider.js';
import styles from './AddToCartCTA.module.css';
export default function AddToCartCTA({
  inCart = false,
  item
}) {
  const {
    dispatch
  } = useCartState();
  const handleClick = event => {
    event.preventDefault();
    dispatch({
      type: ACTIONS.ADD,
      payload: item
    });
  };
  return inCart ? /*#__PURE__*/React.createElement("div", {
    className: styles.inCart
  }, /*#__PURE__*/React.createElement("img", {
    src: "./assets/images/check.svg",
    alt: ""
  }), "In Cart") : /*#__PURE__*/React.createElement("button", {
    className: styles.addToCartCTA,
    onClick: handleClick,
    type: "button",
    "data-id": item.id
  }, "Add to Cart");
}