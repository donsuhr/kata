import * as React from 'react';


import Cart from '../../components/Cart/Cart.js';
import Menu from '../../components/Menu/Menu.js';
import { Provider as CartProvider } from '../Cart/CartStateProvider.js';
import { Provider as MenuProvider } from '../Menu/MenuStateProvider.js';

import styles from './App.module.css';

export default function App() {
  return (
    <MenuProvider>
      <CartProvider>
        <main className={styles.app}>
          <Menu />
          <Cart />
        </main>
      </CartProvider>
    </MenuProvider>
  );
}
