import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';

import { STATUS } from '../../types.js';
import { Provider as MenuProvider } from '../Menu/MenuStateProvider.js';

import Cart from './Cart.js';
import type { CartItem } from './CartStateProvider.js';
import { Provider as CartProvider } from './CartStateProvider.js';

vi.mock('./CartTotals.js', () => ({ default: () => 'cart totals' }));
vi.mock('./CartItem.js', () => ({ default: () => <p>cart item</p> }));

const cart: CartItem[] = [
  {
    id: '0',
    title: '0',
    price: 0,
    imageUrl: '0',
    quantity: 1,
    status: STATUS.SUCCESS,
  },
  {
    id: '1',
    title: '1',
    price: 1,
    imageUrl: '1',
    quantity: 1,
    status: STATUS.SUCCESS,
  },
];

describe('Cart', () => {
  it('renders a CartItem for each item', () => {
    render(
      <MenuProvider>
        <CartProvider initialCartItems={cart}>
          <Cart />
        </CartProvider>
      </MenuProvider>,
    );

    const cartItems = screen.getAllByText('cart item');
    expect(cartItems.length).toBe(cart.length);
  });
});
