import * as React from 'react';
import { formatDollars } from '../../utils.js';
import { useCartState } from './CartStateProvider.js';
import styles from './CartTotals.module.css';
export default function CardTotals() {
  const {
    totals
  } = useCartState();
  return /*#__PURE__*/React.createElement("dl", {
    className: styles.cartTotals
  }, /*#__PURE__*/React.createElement("dt", {
    className: styles.title
  }, "Subtotal:"), /*#__PURE__*/React.createElement("dd", {
    className: styles.amount
  }, formatDollars(totals.subTotal)), /*#__PURE__*/React.createElement("dt", {
    className: styles.title
  }, "Tax:"), /*#__PURE__*/React.createElement("dd", {
    className: styles.amount
  }, formatDollars(totals.taxTotal)), /*#__PURE__*/React.createElement("dt", {
    className: styles.title
  }, "Total:"), /*#__PURE__*/React.createElement("dd", {
    className: `${styles.amount} ${styles.amountTotal}`
  }, formatDollars(totals.grandTotal)));
}