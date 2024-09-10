import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { STATUS } from '../../types.js';
import { Provider as MenuProvider } from '../Menu/MenuStateProvider.js';
import Cart from './Cart.js';
import { Provider as CartProvider } from './CartStateProvider.js';
vi.mock('./CartTotals.js', () => ({
  default: () => 'cart totals'
}));
vi.mock('./CartItem.js', () => ({
  default: () => /*#__PURE__*/React.createElement("p", null, "cart item")
}));
const cart = [{
  id: '0',
  title: '0',
  price: 0,
  imageUrl: '0',
  quantity: 1,
  status: STATUS.SUCCESS
}, {
  id: '1',
  title: '1',
  price: 1,
  imageUrl: '1',
  quantity: 1,
  status: STATUS.SUCCESS
}];
describe('Cart', () => {
  it('renders a CartItem for each item', () => {
    render( /*#__PURE__*/React.createElement(MenuProvider, null, /*#__PURE__*/React.createElement(CartProvider, {
      initialCartItems: cart
    }, /*#__PURE__*/React.createElement(Cart, null))));
    const cartItems = screen.getAllByText('cart item');
    expect(cartItems.length).toBe(cart.length);
  });
});