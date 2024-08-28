import * as React from 'react';

import type { FoodMenuItem } from '../../services/products.js';
import { useCartState, ACTIONS } from '../Cart/CartStateProvider.js';

import styles from './AddToCartCTA.module.css';

type Props = {
  inCart: boolean;
  item: FoodMenuItem;
};

export default function AddToCartCTA({ inCart = false, item }: Props) {
  const { dispatch } = useCartState();

  const handleClick = (event: React.SyntheticEvent) => {
    event.preventDefault();
    dispatch({
      type: ACTIONS.ADD,
      payload: item,
    });
  };

  return inCart ? (
    <div className={styles.inCart}>
      <img src="./assets/images/check.svg" alt="" />
      In Cart
    </div>
  ) : (
    <button
      className={styles.addToCartCTA}
      onClick={handleClick}
      type="button"
      data-id={item.id}
    >
      Add to Cart
    </button>
  );
}
