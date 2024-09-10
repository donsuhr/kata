import * as React from 'react';
import { STATUS } from '../../types.js';
import { formatDollars } from '../../utils.js';
import { useCartState, ACTIONS } from '../Cart/CartStateProvider.js';
import NumberStepper from '../NumberStepper/NumberStepper.js';
import styles from './CartItem.module.css';
const statusIcons = new Map([[STATUS.DIRTY, '⌛️'], [STATUS.LOADING, '🔄'], [STATUS.SUCCESS, ''], [STATUS.ERROR, '⚠️']]);
export default function CartItem({
  item
}) {
  const {
    dispatch
  } = useCartState();
  const {
    id,
    quantity,
    title,
    price,
    imageUrl,
    status
  } = item;
  const statusIcon = statusIcons.get(status) ?? '🔪';
  const totalPrice = formatDollars(price * quantity);
  const handleChange = newVal => {
    dispatch({
      type: ACTIONS.UPDATE,
      payload: {
        ...item,
        quantity: newVal
      }
    });
  };
  return /*#__PURE__*/React.createElement("li", {
    className: styles.item,
    "data-id": id
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.itemImgWrapper
  }, /*#__PURE__*/React.createElement("img", {
    className: styles.itemImg,
    src: imageUrl,
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: styles.quantity
  }, quantity)), /*#__PURE__*/React.createElement("h2", {
    className: styles.title
  }, title), /*#__PURE__*/React.createElement("div", {
    className: styles.price
  }, formatDollars(price)), /*#__PURE__*/React.createElement("div", {
    className: styles.status
  }, statusIcon), /*#__PURE__*/React.createElement(NumberStepper, {
    value: quantity,
    onChange: handleChange,
    min: 0,
    label: "quantity"
  }), /*#__PURE__*/React.createElement("div", {
    className: styles.totalPrice
  }, totalPrice));
}