import * as React from 'react';
import { STATUS } from '../../types.js';
import cardStyles from '../Card/Card.module.css';
import styles from './Menu.module.css';
import MenuItem from './MenuItem.js';
import { useMenuState } from './MenuStateProvider.js';
export default function Menu() {
  const {
    items,
    status
  } = useMenuState();
  return /*#__PURE__*/React.createElement("section", {
    className: `${styles.menu} ${cardStyles.card}`
  }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h1", {
    className: cardStyles.title
  }, "To Go Menu")), status === STATUS.LOADING ? /*#__PURE__*/React.createElement("p", {
    className: styles.loading
  }, "Loading...") : /*#__PURE__*/React.createElement("ul", {
    className: styles.list
  }, items.map(item => /*#__PURE__*/React.createElement(MenuItem, {
    key: item.id,
    item: item
  }))));
}