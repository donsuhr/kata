import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { STATUS } from '../../types.js';
import { Provider as MenuProvider } from '../Menu/MenuStateProvider.js';
import CartItem from './CartItem.js';
import { Provider as CartProvider, useCartState } from './CartStateProvider.js';
let mockHandleTrigger;
vi.mock('../NumberStepper/NumberStepper.js', () => ({
  default: ({
    onChange
  }) => {
    if (!onChange) {
      throw Error('Test expecting NumberStepper to be configured with onChange');
    }
    mockHandleTrigger = onChange;
    return /*#__PURE__*/React.createElement("p", null, "number stepper");
  }
}));
const cartState = [{
  id: '0',
  title: 'target item title',
  price: 0,
  imageUrl: '0',
  quantity: 1,
  status: STATUS.SUCCESS
}];
function CartWrapper() {
  const {
    cart
  } = useCartState();
  return /*#__PURE__*/React.createElement(CartItem, {
    item: cart[0]
  });
}
describe('CartItem', () => {
  it('renders a cart Item', () => {
    render( /*#__PURE__*/React.createElement(MenuProvider, null, /*#__PURE__*/React.createElement(CartProvider, {
      initialCartItems: cartState
    }, /*#__PURE__*/React.createElement(CartWrapper, null))));
    const title = screen.getByText(cartState[0].title);
    expect(title).toBeInTheDocument();
  });
  it('calls dispatch update when numberStepper changes', async () => {
    render( /*#__PURE__*/React.createElement(MenuProvider, null, /*#__PURE__*/React.createElement(CartProvider, {
      initialCartItems: cartState
    }, /*#__PURE__*/React.createElement(CartWrapper, null))));
    if (!mockHandleTrigger) {
      throw Error('NumberStepper did not set onChange');
    }
    mockHandleTrigger(222);
    await waitFor(() => expect(screen.getByText('222')).toBeInTheDocument());
  });
  it('gives you the 🔪 when the status is unknown', () => {
    const testItem = {
      ...cartState[0],
      status: 'fake'
    };
    render( /*#__PURE__*/React.createElement(MenuProvider, null, /*#__PURE__*/React.createElement(CartProvider, {
      initialCartItems: cartState
    }, /*#__PURE__*/React.createElement(CartItem, {
      item: testItem
    }))));
    expect(screen.getByText('🔪')).toBeInTheDocument();
  });
});