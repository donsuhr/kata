import * as React from 'react';

import { FoodMenuItem } from '../../services/products.js';
import { formatDollars } from '../../utils.js';
import { useCartState } from '../Cart/CartStateProvider.js';

import AddToCartCTA from './AddToCartCTA.js';
import styles from './MenuItem.module.css';

type Props = {
  item: FoodMenuItem;
};

export default function MenuItem({ item }: Props) {
  const { imageUrl, title, price } = item;
  const { hasItemById } = useCartState();
  const inCart = hasItemById(item.id);
  return (
    <li className={styles.item}>
      <img src={imageUrl} className={styles.itemImg} alt="" />
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.price}>{formatDollars(price)}</p>
        <AddToCartCTA inCart={inCart} item={item} />
      </div>
    </li>
  );
}
