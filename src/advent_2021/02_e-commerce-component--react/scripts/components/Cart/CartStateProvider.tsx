import * as React from 'react';

import { TAX_RATE } from '../../const.js';
import Persistance from '../../services/cart.js';
import type { FoodMenuItem } from '../../services/products.js';
import { STATUS, Status } from '../../types.js';
import { useMenuState } from '../Menu/MenuStateProvider.js';

export type CartItem = FoodMenuItem & { quantity: number; status: Status };

type ProviderProps = { children: React.ReactNode };

export type ProviderContextType = ItemsState & {
  dispatch: React.Dispatch<ItemReducerAction>;
  hasItemById: (id: string) => boolean;
};

type Totals = {
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
};

type ItemsState = {
  cart: CartItem[];
  totals: Totals;
};

type ItemReducerAction = {
  type: Action;
  payload: FoodMenuItem | CartItem | CartItem[];
};

function isFoodMenuItem(
  payload: ItemReducerAction['payload'],
): payload is FoodMenuItem {
  return (
    !Array.isArray(payload) &&
    !Object.hasOwn(payload as FoodMenuItem, 'quantity')
  );
}

function isCartItem(
  payload: ItemReducerAction['payload'],
): payload is CartItem {
  return (
    !Array.isArray(payload) &&
    Object.hasOwn(payload as FoodMenuItem, 'quantity')
  );
}

export const ACTIONS = {
  ADD: 'add',
  DELETE: 'delete',
  UPDATE: 'update',
  START_SAVE: 'start save',
  SAVE_SUCCESS: 'save success',
  SAVE_ERROR: 'save error',
  RESTORE_CART: 'restore cart',
} as const;

type ActionsType = typeof ACTIONS;
export type Action = ActionsType[keyof ActionsType];

const Context = React.createContext<ProviderContextType | null>(null);
let persistance: Persistance;

const initialItemsState: ItemsState = {
  cart: [],
  totals: {
    subTotal: 0,
    taxTotal: 0,
    grandTotal: 0,
  },
};

const calculateTotals = (cart: CartItem[]): Totals => {
  const subTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const taxTotal = subTotal * TAX_RATE;
  const grandTotal = subTotal + taxTotal;

  return {
    grandTotal,
    taxTotal,
    subTotal,
  };
};

const findCartItemIndexById = (cart: CartItem[], id: FoodMenuItem['id']) =>
  cart.findIndex((item) => item.id === id);

const updateCartItemAtIndex = (
  cart: CartItem[],
  updatedItem: CartItem,
  index: number,
) => [...cart.slice(0, index), { ...updatedItem }, ...cart.slice(index + 1)];

const deleteCartItemAtIndex = (cart: CartItem[], index: number) => [
  ...cart.slice(0, index),
  ...cart.slice(index + 1),
];

const addCartItemToCart = (cart: CartItem[], updatedItem: CartItem) => [
  ...cart,
  { ...updatedItem },
];

const itemsReducer = (
  state: ItemsState,
  action: ItemReducerAction,
): ItemsState => {
  if (isCartItem(action.payload) || isFoodMenuItem(action.payload)) {
    switch (action.type) {
      case ACTIONS.ADD:
        const indexAtAdd = findCartItemIndexById(state.cart, action.payload.id);
        const updatedAddItem: CartItem = {
          ...action.payload,
          quantity: indexAtAdd === -1 ? 1 : state.cart[indexAtAdd].quantity + 1,
          status: STATUS.DIRTY,
        };
        const cartAfterAdd =
          indexAtAdd === -1
            ? addCartItemToCart(state.cart, updatedAddItem)
            : updateCartItemAtIndex(state.cart, updatedAddItem, indexAtAdd);
        const totalAfterAdd = calculateTotals(cartAfterAdd);
        // fire-and-forget
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
          await persistance.write(cartAfterAdd);
        })();

        return { cart: cartAfterAdd, totals: totalAfterAdd };

      case ACTIONS.UPDATE:
        const indexAtEdit = findCartItemIndexById(
          state.cart,
          action.payload.id,
        );
        const cartAfterUpdate =
          (action.payload as CartItem).quantity > 0
            ? updateCartItemAtIndex(
              state.cart,
              { ...(action.payload as CartItem), status: STATUS.DIRTY },
              indexAtEdit,
            )
            : deleteCartItemAtIndex(state.cart, indexAtEdit);
        const totalsAfterUpdate = calculateTotals(cartAfterUpdate);
        // fire-and-forget
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
          await persistance.debouncedWrite(cartAfterUpdate);
        })();

        return { cart: cartAfterUpdate, totals: totalsAfterUpdate };

      case ACTIONS.START_SAVE:
        const indexAtStartSave = findCartItemIndexById(
          state.cart,
          action.payload.id,
        );
        const cartAfterStartSave = updateCartItemAtIndex(
          state.cart,
          { ...(action.payload as CartItem), status: STATUS.LOADING },
          indexAtStartSave,
        );
        return { cart: cartAfterStartSave, totals: state.totals };

      case ACTIONS.SAVE_SUCCESS:
        const indexAtSaveSuccess = findCartItemIndexById(
          state.cart,
          action.payload.id,
        );
        if (state.cart[indexAtSaveSuccess].status !== STATUS.DIRTY) {
          // if its dirty, it was changed during save
          const cartAfterSaveSuccess = updateCartItemAtIndex(
            state.cart,
            { ...(action.payload as CartItem), status: STATUS.SUCCESS },
            indexAtSaveSuccess,
          );
          return { cart: cartAfterSaveSuccess, totals: state.totals };
        }
        return { cart: state.cart, totals: state.totals };

      case ACTIONS.SAVE_ERROR:
        const indexAtSaveError = findCartItemIndexById(
          state.cart,
          action.payload.id,
        );
        const cartAfterSaveError = updateCartItemAtIndex(
          state.cart,
          { ...(action.payload as CartItem), status: STATUS.ERROR },
          indexAtSaveError,
        );
        return { cart: cartAfterSaveError, totals: state.totals };

      default: {
        throw Error(`Unknown action: ${action.type}`);
      }
    }
  }

  if (Array.isArray(action.payload)) {
    switch (action.type) {
      case ACTIONS.RESTORE_CART:
        const totalsAfterRestore = calculateTotals(action.payload);
        return { cart: action.payload, totals: totalsAfterRestore };

      default: {
        throw Error(`Unknown action: ${action.type}`);
      }
    }
  }

  throw Error('Unknown argument type');
};

function Provider({ children }: ProviderProps) {
  const { items: menuItems, status: menuItemsStatus } = useMenuState();

  const [{ cart, totals }, dispatch] = React.useReducer(
    itemsReducer,
    initialItemsState,
  );

  persistance = React.useMemo(() => new Persistance(dispatch), [dispatch]);

  React.useEffect(() => {
    if (menuItemsStatus === STATUS.SUCCESS && menuItems.length > 0) {
      persistance.restore(menuItems);
    }
  }, [menuItems, menuItemsStatus]);

  const hasItemById = (id: string) =>
    cart.some((cartItem) => cartItem.id === id);

  const value = React.useMemo(
    () => ({ totals, cart, dispatch, hasItemById }),
    [cart, totals],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function useCartState() {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      'useCartState must be used within a Provider from CartStateProvider',
    );
  }
  return context;
}

export { Provider, useCartState };
