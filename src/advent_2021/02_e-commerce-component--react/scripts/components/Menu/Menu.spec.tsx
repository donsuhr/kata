import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { FoodMenuItem } from '../../services/products.js';
import { Provider as CartProvider } from '../Cart/CartStateProvider.js';

import Menu from './Menu.js';
import { Provider as MenuProvider } from './MenuStateProvider.js';

let origFetch: typeof global.fetch;

describe('Menu', () => {
  beforeAll(() => {
    origFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.fetch = origFetch;
  });

  beforeEach(() => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;
    const data: FoodMenuItem[] = [
      { id: '1', title: 'target title', price: 2.09, imageUrl: 'xxx.jpg' },
    ];
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        new Promise((resolve) => {
          resolve({
            data,
          });
        }),
    } as Response);
  });

  it('renders loading', () => {
    render(
      <MenuProvider>
        <Menu />
      </MenuProvider>,
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders cart items', async () => {
    const data: FoodMenuItem[] = [
      { id: '1', title: 'target title', price: 2.09, imageUrl: 'xxx.jpg' },
    ];
    const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        new Promise((resolve) => {
          resolve({
            data,
          });
        }),
    } as Response);
    render(
      <MenuProvider>
        <CartProvider>
          <Menu />
        </CartProvider>
      </MenuProvider>,
    );
    await waitFor(() =>
      expect(screen.getByText(data[0].title)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
