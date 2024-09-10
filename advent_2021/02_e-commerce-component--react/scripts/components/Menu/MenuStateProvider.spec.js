import { renderHook, waitFor } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import * as ProductsService from '../../services/products.js';
import { STATUS } from '../../types.js';
import { Provider, useMenuState } from './MenuStateProvider.js';
vi.mock(import('../../services/products.js'));
describe('MenuStateProvider', () => {
  it('throws when not inside provider', () => {
    vi.spyOn(console, 'error');
    // eslint-disable-next-line no-console
    const mockConsoleError = console.error;
    mockConsoleError.mockImplementation(() => {});

    // const { result } = renderHook(() => useMenuState())
    expect(() => renderHook(() => useMenuState())).toThrow(/within a Provider/i);
    mockConsoleError.mockRestore();
  });
  it("doesn't throw when it has a provider wrapper", () => {
    const wrapper = ({
      children
    }) => /*#__PURE__*/React.createElement(Provider, null, children);
    expect(() => renderHook(() => useMenuState(), {
      wrapper
    })).not.toThrow();
  });
  it('calls though to the getItems and updates items', async () => {
    const foodItem = {
      id: '2',
      title: 'target title',
      price: 2.09,
      imageUrl: 'xxx.jpg'
    };
    const mockGetItems = ProductsService.getItems;
    mockGetItems.mockResolvedValue([foodItem]);
    const wrapper = ({
      children
    }) => /*#__PURE__*/React.createElement(Provider, null, children);
    const {
      result
    } = renderHook(() => useMenuState(), {
      wrapper
    });
    expect(ProductsService.getItems).toHaveBeenCalled();
    await waitFor(() => expect(result.current.status).toEqual(STATUS.SUCCESS));
    await waitFor(() => expect(result.current.items).toEqual([foodItem]));
  });
  it('sets the status to error when getItems throws', async () => {
    const mockGetItems = ProductsService.getItems;
    mockGetItems.mockImplementation(() => {
      throw new Error('foo error');
    });
    const wrapper = ({
      children
    }) => /*#__PURE__*/React.createElement(Provider, null, children);
    const {
      result
    } = renderHook(() => useMenuState(), {
      wrapper
    });
    await waitFor(() => expect(result.current.status).toEqual(STATUS.ERROR));
  });
});