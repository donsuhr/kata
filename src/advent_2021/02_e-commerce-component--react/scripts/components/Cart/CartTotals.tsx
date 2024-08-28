import * as React from 'react';

import { formatDollars } from '../../utils.js';

import { useCartState } from './CartStateProvider.js';
import styles from './CartTotals.module.css';

export default function CardTotals() {
  const { totals } = useCartState();
  return (
    <dl className={styles.cartTotals}>
      <dt className={styles.title}>Subtotal:</dt>
      <dd className={styles.amount}>{formatDollars(totals.subTotal)}</dd>
      <dt className={styles.title}>Tax:</dt>
      <dd className={styles.amount}>{formatDollars(totals.taxTotal)}</dd>
      <dt className={styles.title}>Total:</dt>
      <dd className={`${styles.amount} ${styles.amountTotal}`}>
        {formatDollars(totals.grandTotal)}
      </dd>
    </dl>
  );
}
