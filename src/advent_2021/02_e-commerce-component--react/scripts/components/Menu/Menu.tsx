import * as React from 'react';

import { STATUS } from '../../types.js';
import cardStyles from '../Card/Card.module.css';

import styles from './Menu.module.css';
import MenuItem from './MenuItem.js';
import { useMenuState } from './MenuStateProvider.js';



export default function Menu() {
  const { items, status } = useMenuState();

  return (
    <section className={`${styles.menu} ${cardStyles.card}`}>
      <header>
        <h1 className={cardStyles.title}>To Go Menu</h1>
      </header>
      <ul className={styles.list}>
        {status === STATUS.LOADING ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          items.map((item) => <MenuItem key={item.id} item={item} />)
        )}
      </ul>
    </section>
  );
}
