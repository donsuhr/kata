import * as React from 'react';

import { STATUS, Status } from '../../types.js';
import { formatDollars } from '../../utils.js';
import { useCartState, ACTIONS } from '../Cart/CartStateProvider.js';
import NumberStepper from '../NumberStepper/NumberStepper.js';

import styles from './CartItem.module.css';
import type { CartItem as CartItemType } from './CartStateProvider.js';

type Props = {
  item: CartItemType;
};

const statusIcons = new Map<Status, string>([
  [STATUS.DIRTY, '⌛️'],
  [STATUS.LOADING, '🔄'],
  [STATUS.SUCCESS, ''],
  [STATUS.ERROR, '⚠️'],
]);

export default function CartItem({ item }: Props) {
  const { dispatch } = useCartState();
  const { id, quantity, title, price, imageUrl, status } = item;
  const statusIcon = statusIcons.get(status) ?? '🔪';
  const totalPrice = formatDollars(price * quantity);

  const handleChange = (newVal: number) => {
    dispatch({
      type: ACTIONS.UPDATE,
      payload: { ...item, quantity: newVal },
    });
  };

  return (
    <li className={styles.item} data-id={id}>
      <div className={styles.itemImgWrapper}>
        <img className={styles.itemImg} src={imageUrl} alt="" />
        <div className={styles.quantity}>{quantity}</div>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.price}>{formatDollars(price)}</div>
      <div className={styles.status}>{statusIcon}</div>
      <NumberStepper value={quantity} onChange={handleChange} min={0} />
      <div className={styles.totalPrice}>{totalPrice}</div>
    </li>
  );
}
