import * as React from 'react';
import { TAX_RATE } from '../../const.js';
import Persistance from '../../services/cart.js';
import { STATUS } from '../../types.js';
import { useMenuState } from '../Menu/MenuStateProvider.js';
function isFoodMenuItem(payload) {
  return !Array.isArray(payload) && !Object.hasOwn(payload, 'quantity') && Object.hasOwn(payload, 'id') && Object.hasOwn(payload, 'title') && Object.hasOwn(payload, 'price');
}
function isCartItem(payload) {
  return !Array.isArray(payload) && Object.hasOwn(payload, 'quantity');
}
export const ACTIONS = {
  ADD: 'add',
  DELETE: 'delete',
  UPDATE: 'update',
  START_SAVE: 'start save',
  SAVE_SUCCESS: 'save success',
  SAVE_ERROR: 'save error',
  RESTORE_CART: 'restore cart'
};
const Context = /*#__PURE__*/React.createContext(null);
let persistance;
const defaultState = {
  cart: [],
  totals: {
    subTotal: 0,
    taxTotal: 0,
    grandTotal: 0
  }
};
const calculateTotals = cart => {
  const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxTotal = subTotal * TAX_RATE;
  const grandTotal = subTotal + taxTotal;
  return {
    grandTotal,
    taxTotal,
    subTotal
  };
};
const findCartItemIndexById = (cart, id) => cart.findIndex(item => item.id === id);
const updateCartItemAtIndex = (cart, updatedItem, index) => [...cart.slice(0, index), {
  ...updatedItem
}, ...cart.slice(index + 1)];
const deleteCartItemAtIndex = (cart, index) => [...cart.slice(0, index), ...cart.slice(index + 1)];
const addCartItemToCart = (cart, updatedItem) => [...cart, {
  ...updatedItem
}];
export const itemsReducer = (state, action) => {
  if (isCartItem(action.payload) || isFoodMenuItem(action.payload)) {
    switch (action.type) {
      case ACTIONS.ADD:
        const indexAtAdd = findCartItemIndexById(state.cart, action.payload.id);
        const updatedAddItem = {
          ...action.payload,
          quantity: indexAtAdd === -1 ? 1 : state.cart[indexAtAdd].quantity + 1,
          status: STATUS.DIRTY
        };
        const cartAfterAdd = indexAtAdd === -1 ? addCartItemToCart(state.cart, updatedAddItem) : updateCartItemAtIndex(state.cart, updatedAddItem, indexAtAdd);
        const totalAfterAdd = calculateTotals(cartAfterAdd);
        // fire-and-forget
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
          await persistance.write(cartAfterAdd);
        })();
        return {
          cart: cartAfterAdd,
          totals: totalAfterAdd
        };
      case ACTIONS.UPDATE:
        const indexAtEdit = findCartItemIndexById(state.cart, action.payload.id);
        const cartAfterUpdate = action.payload.quantity > 0 ? updateCartItemAtIndex(state.cart, {
          ...action.payload,
          status: STATUS.DIRTY
        }, indexAtEdit) : deleteCartItemAtIndex(state.cart, indexAtEdit);
        const totalsAfterUpdate = calculateTotals(cartAfterUpdate);
        // fire-and-forget
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
          await persistance.debouncedWrite(cartAfterUpdate);
        })();
        return {
          cart: cartAfterUpdate,
          totals: totalsAfterUpdate
        };
      case ACTIONS.START_SAVE:
        const indexAtStartSave = findCartItemIndexById(state.cart, action.payload.id);
        const cartAfterStartSave = updateCartItemAtIndex(state.cart, {
          ...action.payload,
          status: STATUS.LOADING
        }, indexAtStartSave);
        return {
          cart: cartAfterStartSave,
          totals: state.totals
        };
      case ACTIONS.SAVE_SUCCESS:
        const indexAtSaveSuccess = findCartItemIndexById(state.cart, action.payload.id);
        if (state.cart[indexAtSaveSuccess].status !== STATUS.DIRTY) {
          // if its dirty, it was changed during save
          const cartAfterSaveSuccess = updateCartItemAtIndex(state.cart, {
            ...action.payload,
            status: STATUS.SUCCESS
          }, indexAtSaveSuccess);
          return {
            cart: cartAfterSaveSuccess,
            totals: state.totals
          };
        }
        return {
          cart: state.cart,
          totals: state.totals
        };
      case ACTIONS.SAVE_ERROR:
        const indexAtSaveError = findCartItemIndexById(state.cart, action.payload.id);
        const cartAfterSaveError = updateCartItemAtIndex(state.cart, {
          ...action.payload,
          status: STATUS.ERROR
        }, indexAtSaveError);
        return {
          cart: cartAfterSaveError,
          totals: state.totals
        };
      default:
        {
          throw Error(`Unknown action: ${action.type}`);
        }
    }
  }
  if (Array.isArray(action.payload)) {
    switch (action.type) {
      case ACTIONS.RESTORE_CART:
        const totalsAfterRestore = calculateTotals(action.payload);
        return {
          cart: action.payload,
          totals: totalsAfterRestore
        };
      default:
        {
          throw Error(`Unknown action: ${action.type}`);
        }
    }
  }
  throw Error('Unknown argument type');
};
function Provider({
  children,
  initialCartItems
}) {
  const {
    items: menuItems,
    status: menuItemsStatus
  } = useMenuState();
  const initialCart = initialCartItems ?? defaultState.cart;
  const initialTotals = calculateTotals(initialCart);
  const initialReducerState = {
    cart: initialCart,
    totals: initialTotals
  };
  const [{
    cart,
    totals
  }, dispatch] = React.useReducer(itemsReducer, initialReducerState);
  persistance = React.useMemo(() => new Persistance(dispatch), [dispatch]);
  React.useEffect(() => {
    if (menuItemsStatus === STATUS.SUCCESS && menuItems.length > 0) {
      persistance.restore(menuItems);
    }
  }, [menuItems, menuItemsStatus]);
  const hasItemById = id => cart.some(cartItem => cartItem.id === id);
  const value = React.useMemo(() => ({
    totals,
    cart,
    dispatch,
    hasItemById
  }), [cart, totals]);
  return /*#__PURE__*/React.createElement(Context.Provider, {
    value: value
  }, children);
}
function useCartState() {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error('useCartState must be used within a Provider from CartStateProvider');
  }
  return context;
}
export { Provider, useCartState };