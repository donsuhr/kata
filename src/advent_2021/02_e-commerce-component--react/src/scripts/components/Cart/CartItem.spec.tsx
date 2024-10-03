import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';

import { STATUS } from '../../types.js';
import { Provider as MenuProvider } from '../Menu/MenuStateProvider.js';
import type { Props as NumberStepperProps } from '../NumberStepper/NumberStepper.js';

import CartItem from './CartItem.js';
import {
  Provider as CartProvider,
  CartItem as CartItemType,
  useCartState,
} from './CartStateProvider.js';

let mockHandleTrigger: NumberStepperProps['onChange'];

vi.mock('../NumberStepper/NumberStepper.js', () => ({
  default: ({ onChange }: { onChange: typeof mockHandleTrigger }) => {
    if (!onChange) {
      throw Error(
        'Test expecting NumberStepper to be configured with onChange',
      );
    }
    mockHandleTrigger = onChange;
    return <p>number stepper</p>;
  },
}));

const cartState: CartItemType[] = [
  {
    id: '0',
    title: 'target item title',
    price: 0,
    imageUrl: '0',
    quantity: 1,
    status: STATUS.SUCCESS,
  },
];

function CartWrapper() {
  const { cart } = useCartState();
  return <CartItem item={cart[0]} />;
}

describe('CartItem', () => {
  it('renders a cart Item', () => {
    render(
      <MenuProvider>
        <CartProvider initialCartItems={cartState}>
          <CartWrapper />
        </CartProvider>
      </MenuProvider>,
    );

    const title = screen.getByText(cartState[0].title);
    expect(title).toBeInTheDocument();
  });

  it('calls dispatch update when numberStepper changes', async () => {
    render(
      <MenuProvider>
        <CartProvider initialCartItems={cartState}>
          <CartWrapper />
        </CartProvider>
      </MenuProvider>,
    );
    if (!mockHandleTrigger) {
      throw Error('NumberStepper did not set onChange');
    }
    mockHandleTrigger(222);
    await waitFor(() => expect(screen.getByText('222')).toBeInTheDocument());
  });

  it('gives you the 🔪 when the status is unknown', () => {
    const testItem = {
      ...cartState[0],
      status: 'fake',
    };

    render(
      <MenuProvider>
        <CartProvider initialCartItems={cartState}>
          {/* @ts-expect-error: test error state */}
          <CartItem item={testItem} />
        </CartProvider>
      </MenuProvider>,
    );
    expect(screen.getByText('🔪')).toBeInTheDocument();
  });
});
