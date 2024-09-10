import { renderHook, waitFor } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TAX_RATE } from '../../const.js';
import { STATUS } from '../../types.js';
import { Provider as MenuStateProvider } from '../Menu/MenuStateProvider.js';
import { ACTIONS, Provider as CartStateProvider, itemsReducer, useCartState } from './CartStateProvider.js';
const data = [{
  id: '1',
  title: 'target title',
  price: 2.09,
  imageUrl: 'xxx.jpg'
}];
vi.mock(import('../../services/products.js'), () => ({
  getItems: vi.fn(() => data)
}));
const mockPersistance = {
  write: vi.fn(),
  restore: vi.fn(),
  debouncedWrite: vi.fn()
};
vi.mock(import('../../services/cart.js'), () => ({
  default: vi.fn(() => mockPersistance)
}));
const cart = [{
  id: '0',
  title: '0',
  price: 0,
  imageUrl: '0',
  quantity: 1,
  status: STATUS.SUCCESS
}];
describe('CartStateProvider', () => {
  it('throws when not inside provider', () => {
    vi.spyOn(console, 'error');
    // eslint-disable-next-line no-console
    const mockConsoleError = console.error;
    mockConsoleError.mockImplementation(() => {});

    // const { result } = renderHook(() => useMenuState())
    expect(() => renderHook(() => useCartState())).toThrow(/within a Provider/i);
    mockConsoleError.mockRestore();
  });
  it("doesn't throw when it has a provider wrapper", () => {
    const wrapper = ({
      children
    }) => /*#__PURE__*/React.createElement(MenuStateProvider, null, /*#__PURE__*/React.createElement(CartStateProvider, null, children));
    expect(() => renderHook(() => useCartState(), {
      wrapper
    })).not.toThrow();
  });
  it('calls the persistance layer', async () => {
    const wrapper = ({
      children
    }) => /*#__PURE__*/React.createElement(MenuStateProvider, {
      initialStatus: STATUS.SUCCESS
    }, /*#__PURE__*/React.createElement(CartStateProvider, null, children));
    renderHook(() => useCartState(), {
      wrapper
    });
    await waitFor(() => expect(mockPersistance.restore).toHaveBeenCalled());
  });
  it('has a handy hasItemById utility function', () => {
    const wrapper = ({
      children
    }) => /*#__PURE__*/React.createElement(MenuStateProvider, {
      initialStatus: STATUS.SUCCESS
    }, /*#__PURE__*/React.createElement(CartStateProvider, {
      initialCartItems: cart
    }, children));
    const {
      result: {
        current: {
          hasItemById
        }
      }
    } = renderHook(() => useCartState(), {
      wrapper
    });
    expect(hasItemById('1')).toBe(false);
    expect(hasItemById('0')).toBe(true);
  });
  describe('Reducer', () => {
    const startingState = {
      cart: [],
      totals: {
        subTotal: 0,
        taxTotal: 0,
        grandTotal: 0
      }
    };
    const typicalItem = {
      id: '0',
      title: '0',
      price: 1,
      imageUrl: '0',
      quantity: 1,
      status: STATUS.SUCCESS
    };
    it('throws an error for an unknown action with incorrect payload / non array payload', () => {
      const action = {
        // ADD is unknown for CartItem[] Array
        type: ACTIONS.ADD,
        // @ts-expect-error: testing errors
        payload: {
          id: 'bar',
          title: 'foo'
        }
      };
      expect(() => itemsReducer(startingState, action)).toThrow(/unknown argument/i);
    });
    it('throws an error for an unknown action with a CartItem payload', () => {
      const action = {
        // RESTORE_CART is unknown for CartItem
        type: ACTIONS.RESTORE_CART,
        payload: {
          ...typicalItem
        }
      };
      expect(() => itemsReducer(startingState, action)).toThrow(/unknown action/i);
    });
    describe('ADD', () => {
      it('can add an item to the cart', () => {
        const result = {
          cart: [{
            ...typicalItem,
            status: STATUS.DIRTY
          }],
          totals: {
            subTotal: 1,
            taxTotal: 1 * TAX_RATE,
            grandTotal: 1 * TAX_RATE + 1
          }
        };
        const action = {
          type: ACTIONS.ADD,
          payload: {
            ...typicalItem
          }
        };
        expect(itemsReducer(startingState, action)).toEqual(result);
      });
      it('will increase the quantity of an existing item called with add', () => {
        const result = {
          cart: [{
            ...typicalItem,
            quantity: 3,
            status: STATUS.DIRTY
          }],
          totals: {
            subTotal: 3,
            taxTotal: 3 * TAX_RATE,
            grandTotal: 3 * TAX_RATE + 3
          }
        };
        const startingStateWithItem = {
          ...startingState,
          cart: [{
            ...result.cart[0],
            quantity: 2
          }]
        };
        const action = {
          type: ACTIONS.ADD,
          payload: {
            ...typicalItem
          }
        };
        expect(itemsReducer(startingStateWithItem, action)).toEqual(result);
      });
      describe('UPDATE', () => {
        it('can update an item', () => {
          const result = {
            cart: [{
              ...typicalItem,
              quantity: 44,
              status: STATUS.DIRTY
            }],
            totals: {
              subTotal: 44,
              taxTotal: 44 * TAX_RATE,
              grandTotal: 44 * TAX_RATE + 44
            }
          };
          const startingStateWithItem = {
            ...startingState,
            cart: [{
              ...result.cart[0],
              quantity: 2
            }]
          };
          const action = {
            type: ACTIONS.UPDATE,
            payload: {
              ...typicalItem,
              quantity: 44
            }
          };
          expect(itemsReducer(startingStateWithItem, action)).toEqual(result);
        });
        it('deletes an item if you set its quantity to zero', () => {
          const result = {
            cart: [],
            totals: {
              subTotal: 0,
              taxTotal: 0 * TAX_RATE,
              grandTotal: 0 * TAX_RATE + 0
            }
          };
          const startingStateWithItem = {
            ...startingState,
            cart: [{
              ...typicalItem,
              quantity: 3
            }]
          };
          const action = {
            type: ACTIONS.UPDATE,
            payload: {
              ...typicalItem,
              quantity: 0
            }
          };
          expect(itemsReducer(startingStateWithItem, action)).toEqual(result);
        });
      });
      describe('START_SAVE', () => {
        it('sets the status to "loading" on START_SAVE', () => {
          const result = {
            cart: [{
              ...typicalItem,
              status: STATUS.LOADING
            }],
            totals: {
              subTotal: 1,
              taxTotal: 1 * TAX_RATE,
              grandTotal: 1 * TAX_RATE + 1
            }
          };
          const startingStateWithItem = {
            ...startingState,
            cart: [{
              ...result.cart[0],
              status: STATUS.DIRTY
            }],
            totals: {
              subTotal: 1,
              taxTotal: 1 * TAX_RATE,
              grandTotal: 1 * TAX_RATE + 1
            }
          };
          const action = {
            type: ACTIONS.START_SAVE,
            payload: {
              ...typicalItem
            }
          };
          expect(itemsReducer(startingStateWithItem, action)).toEqual(result);
        });
      });
      describe('SAVE_SUCCESS', () => {
        it('sets the status to "success" on START_SAVE', () => {
          const result = {
            cart: [{
              ...typicalItem,
              status: STATUS.SUCCESS
            }],
            totals: {
              subTotal: 1,
              taxTotal: 1 * TAX_RATE,
              grandTotal: 1 * TAX_RATE + 1
            }
          };
          const startingStateWithItem = {
            ...startingState,
            cart: [{
              ...result.cart[0],
              status: STATUS.LOADING
            }],
            totals: {
              subTotal: 1,
              taxTotal: 1 * TAX_RATE,
              grandTotal: 1 * TAX_RATE + 1
            }
          };
          const action = {
            type: ACTIONS.SAVE_SUCCESS,
            payload: {
              ...typicalItem
            }
          };
          expect(itemsReducer(startingStateWithItem, action)).toEqual(result);
        });
        it('accounts for race condition of update after save', () => {
          const result = {
            cart: [{
              ...typicalItem,
              status: STATUS.DIRTY,
              title: 'updated title'
            }],
            totals: {
              subTotal: 1,
              taxTotal: 1 * TAX_RATE,
              grandTotal: 1 * TAX_RATE + 1
            }
          };
          const startingStateWithItem = {
            ...startingState,
            cart: [{
              ...result.cart[0],
              status: STATUS.LOADING
            }],
            totals: {
              subTotal: 1,
              taxTotal: 1 * TAX_RATE,
              grandTotal: 1 * TAX_RATE + 1
            }
          };
          const firstSaveAction = {
            type: ACTIONS.START_SAVE,
            payload: {
              ...typicalItem
            }
          };
          const secondEditAction = {
            type: ACTIONS.UPDATE,
            payload: {
              ...typicalItem,
              title: result.cart[0].title
            }
          };
          const thirdSaveSuccessAction = {
            type: ACTIONS.SAVE_SUCCESS,
            payload: {
              ...typicalItem
            }
          };

          // 1, start a save
          const firstState = itemsReducer(startingStateWithItem, firstSaveAction);
          expect(firstState.cart[0].title).toBe(typicalItem.title);
          expect(firstState.cart[0].status).toBe(STATUS.LOADING);
          // 2, edit it before it finishes the save
          const secondState = itemsReducer(firstState, secondEditAction);
          expect(secondState.cart[0].title).toBe(result.cart[0].title);
          expect(secondState.cart[0].status).toBe(STATUS.DIRTY);
          // 3, test save action does not overwrite the updated title
          expect(itemsReducer(secondState, thirdSaveSuccessAction)).toEqual(result);
        });
      });
      describe('SAVE_ERROR', () => {
        it('sets the status to "error" on SAVE_ERROR', () => {
          const result = {
            cart: [{
              ...typicalItem,
              status: STATUS.ERROR
            }],
            totals: {
              subTotal: 1,
              taxTotal: 1 * TAX_RATE,
              grandTotal: 1 * TAX_RATE + 1
            }
          };
          const startingStateWithItem = {
            ...startingState,
            cart: [{
              ...result.cart[0],
              status: STATUS.LOADING
            }],
            totals: {
              subTotal: 1,
              taxTotal: 1 * TAX_RATE,
              grandTotal: 1 * TAX_RATE + 1
            }
          };
          const action = {
            type: ACTIONS.SAVE_ERROR,
            payload: {
              ...typicalItem
            }
          };
          expect(itemsReducer(startingStateWithItem, action)).toEqual(result);
        });
      });
      describe('RESTORE_CART', () => {
        it('throws an error for an unknown action with a CartItem[] array payload', () => {
          const action = {
            // ADD is unknown for CartItem[] Array
            type: ACTIONS.ADD,
            payload: [{
              ...typicalItem
            }]
          };
          expect(() => itemsReducer(startingState, action)).toThrow(/unknown action/i);
        });
        it('can set the cart to an array of items', () => {
          const resultCart = [{
            ...typicalItem
          }, {
            id: '1',
            title: '1',
            price: 1,
            imageUrl: '0',
            quantity: 1,
            status: STATUS.SUCCESS
          }];
          const result = {
            cart: resultCart,
            totals: {
              subTotal: 2,
              taxTotal: 2 * TAX_RATE,
              grandTotal: 2 * TAX_RATE + 2
            }
          };
          const action = {
            type: ACTIONS.RESTORE_CART,
            payload: resultCart
          };
          expect(itemsReducer(startingState, action)).toEqual(result);
        });
      });
    });
  });
});