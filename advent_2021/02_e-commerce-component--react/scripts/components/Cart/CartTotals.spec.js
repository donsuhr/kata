import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { TAX_RATE } from '../../const.js';
import { STATUS } from '../../types.js';
import { Provider as MenuProvider } from '../Menu/MenuStateProvider.js';
import { Provider as CartProvider } from './CartStateProvider.js';
import CartTotals from './CartTotals.js';
vi.mock('./CartItem.js', () => ({
  default: () => /*#__PURE__*/React.createElement("p", null, "cart item")
}));
const cart = [{
  id: '0',
  title: '0',
  price: 1,
  imageUrl: '0',
  quantity: 1,
  status: STATUS.SUCCESS
}, {
  id: '1',
  title: '1',
  price: 2,
  imageUrl: '1',
  quantity: 1,
  status: STATUS.SUCCESS
}];
describe('CartTotals', () => {
  it('renders a CartTotals for each item', () => {
    const subTotal = cart[0].price + cart[1].price;
    const taxTotal = subTotal * TAX_RATE;
    const grandTotal = subTotal + taxTotal;
    const grandTotalFloat = grandTotal.toFixed(2);
    const taxTotalFloat = taxTotal.toFixed(2);
    render( /*#__PURE__*/React.createElement(MenuProvider, null, /*#__PURE__*/React.createElement(CartProvider, {
      initialCartItems: cart
    }, /*#__PURE__*/React.createElement(CartTotals, null))));
    const taxTotalEl = screen.getByText(new RegExp(`${taxTotalFloat}`, 'g'));
    expect(taxTotalEl).toBeInTheDocument();
    const grandTotalEl = screen.getByText(new RegExp(`${grandTotalFloat}`, 'g'));
    expect(grandTotalEl).toBeInTheDocument();
  });
});