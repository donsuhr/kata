import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider as CartProvider } from '../Cart/CartStateProvider.js';
import Menu from './Menu.js';
import { Provider as MenuProvider } from './MenuStateProvider.js';
let origFetch;
describe('Menu', () => {
  beforeAll(() => {
    origFetch = global.fetch;
    global.fetch = vi.fn();
  });
  afterAll(() => {
    global.fetch = origFetch;
  });
  beforeEach(() => {
    const mockFetch = global.fetch;
    const data = [{
      id: '1',
      title: 'target title',
      price: 2.09,
      imageUrl: 'xxx.jpg'
    }];
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => new Promise(resolve => {
        resolve({
          data
        });
      })
    });
  });
  it('renders loading', () => {
    render( /*#__PURE__*/React.createElement(MenuProvider, null, /*#__PURE__*/React.createElement(Menu, null)));
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  it('renders cart items', async () => {
    const data = [{
      id: '1',
      title: 'target title',
      price: 2.09,
      imageUrl: 'xxx.jpg'
    }];
    const mockFetch = global.fetch;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => new Promise(resolve => {
        resolve({
          data
        });
      })
    });
    render( /*#__PURE__*/React.createElement(MenuProvider, null, /*#__PURE__*/React.createElement(CartProvider, null, /*#__PURE__*/React.createElement(Menu, null))));
    await waitFor(() => expect(screen.getByText(data[0].title)).toBeInTheDocument());
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});