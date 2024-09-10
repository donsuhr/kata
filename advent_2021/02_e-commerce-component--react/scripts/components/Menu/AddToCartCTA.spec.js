import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { STATUS } from '../../types.js';
import AddToCartCTA from './AddToCartCTA.js';
const mockDispatch = vi.fn();
vi.mock('../Cart/CartStateProvider.js', async () => {
  const actual = await vi.importActual('../Cart/CartStateProvider.tsx');
  return {
    ...actual,
    useCartState: vi.fn(() => ({
      dispatch: mockDispatch
    }))
  };
});
const item = {
  id: '0',
  title: '0',
  price: 0,
  imageUrl: '0',
  quantity: 1,
  status: STATUS.SUCCESS
};
describe('AddToCartCTA', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders a button when inCart false', () => {
    render( /*#__PURE__*/React.createElement(AddToCartCTA, {
      inCart: false,
      item: item
    }));
    const button = screen.getByText('Add to Cart');
    expect(button).toBeInTheDocument();
  });
  it('renders a div when inCart true', () => {
    render( /*#__PURE__*/React.createElement(AddToCartCTA, {
      inCart: true,
      item: item
    }));
    const div = screen.getByText('In Cart');
    expect(div).toBeInTheDocument();
  });
  it('calls dispatch when clicked', () => {
    render( /*#__PURE__*/React.createElement(AddToCartCTA, {
      inCart: false,
      item: item
    }));
    const button = screen.getByText('Add to Cart');
    fireEvent.click(button);
    expect(mockDispatch).toHaveBeenCalledOnce();
  });
});