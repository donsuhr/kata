import * as React from 'react';

import { TAX_RATE } from '../../const.js';
import type { FoodMenuItem } from '../../services/products.js';
import { STATUS, Status } from '../../types.js';

export type CartItem = FoodMenuItem & { quantity: number; status: Status };

type ProviderProps = { children: React.ReactNode };

type ProviderContextType = ItemsState & {
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
  payload: FoodMenuItem | CartItem;
};

export const ACTIONS = {
  ADD: 'add',
  DELETE: 'delete',
  UPDATE: 'update',
} as const;

type ActionsType = typeof ACTIONS;
export type Action = ActionsType[keyof ActionsType];

const Context = React.createContext<ProviderContextType | null>(null);

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
      return { cart: cartAfterAdd, totals: totalAfterAdd };

    case ACTIONS.UPDATE:
      const indexAtEdit = findCartItemIndexById(state.cart, action.payload.id);
      const cartAfterUpdate =
        (action.payload as CartItem).quantity > 0
          ? updateCartItemAtIndex(
            state.cart,
            { ...(action.payload as CartItem), status: STATUS.DIRTY },
            indexAtEdit,
          )
          : deleteCartItemAtIndex(state.cart, indexAtEdit);
      const totalsAfterUpdate = calculateTotals(cartAfterUpdate);
      return { cart: cartAfterUpdate, totals: totalsAfterUpdate };

    default: {
      throw Error(`Unknown action: ${action.type}`);
    }
  }
};

function Provider({ children }: ProviderProps) {
  const [{ cart, totals }, dispatch] = React.useReducer(
    itemsReducer,
    initialItemsState,
  );

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
