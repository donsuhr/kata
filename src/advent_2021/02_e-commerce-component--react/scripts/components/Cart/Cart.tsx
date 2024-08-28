import * as React from 'react';

import cardStyles from '../Card/Card.module.css';

import styles from './Cart.module.css';
import CartItem from './CartItem.js';
import { useCartState } from './CartStateProvider.js';
import CartTotals from './CartTotals.js';

export default function Cart() {
  const {  cart } = useCartState();
  return (
    <section className={`${styles.cart} ${cardStyles.card}`}>
      <header>
        <h1 className={cardStyles.title}>Your Cart</h1>
      </header>
      <ul className={styles.list} >
      {cart.map((item) => <CartItem key={item.id} item={item} />)}
      </ul>

      <CartTotals />
    </section>
  );
}
