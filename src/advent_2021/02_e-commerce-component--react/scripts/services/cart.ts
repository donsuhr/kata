import {
  ACTIONS,
  CartItem,
  ProviderContextType,
} from '../components/Cart/CartStateProvider.js';
import { LS_CART_KEY } from '../const.js';
import { STATUS } from '../types.js';
import { debouncePromise, wait } from '../utils.js';

import { FoodMenuItem } from './products.js';

type LocalStorageItem = { id: string; quantity: number };

export default class Persistance {
  #dispatch: ProviderContextType['dispatch'];

  #debouncedWrite;

  constructor(dispatch: ProviderContextType['dispatch']) {
    this.#dispatch = dispatch;
    this.#debouncedWrite = debouncePromise(this.write.bind(this));
  }

  async write(cart: CartItem[]) {
    const values = cart.map(
      ({ id, quantity }): LocalStorageItem => ({
        id,
        quantity,
      }),
    );
    const items = cart.filter((item) => item.status === STATUS.DIRTY);
    try {
      items.forEach((item) => {
        this.#dispatch({
          type: ACTIONS.START_SAVE,
          payload: item,
        });
      });
      await wait();
      localStorage.setItem(LS_CART_KEY, JSON.stringify(values));
      items.forEach((item) => {
        this.#dispatch({
          type: ACTIONS.SAVE_SUCCESS,
          payload: item,
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('LocalStorage error', e);
      items.forEach((item) => {
        this.#dispatch({
          type: ACTIONS.SAVE_ERROR,
          payload: item,
        });
      });
    }
  }

  // @debounced()
  async debouncedWrite(cart: CartItem[]) {
    await this.#debouncedWrite(cart);
  }

  restore(menuItems: FoodMenuItem[]) {
    try {
      const values = JSON.parse(
        localStorage.getItem(LS_CART_KEY) ?? '',
      ) as LocalStorageItem[];

      const cartItems = values.reduce<CartItem[]>((acc, localStorageItem) => {
        const item = menuItems.find(
          (menuItem) => menuItem.id === localStorageItem.id,
        );
        if (!item) {
          // eslint-disable-next-line no-console
          console.warn(
            `LocalStorage item with id ${localStorageItem.id} not found in menu items`,
          );
        } else {
          acc.push({
            ...item,
            quantity: localStorageItem.quantity,
            status: STATUS.SUCCESS,
          });
        }
        return acc;
      }, []);

      this.#dispatch({
        type: ACTIONS.RESTORE_CART,
        payload: cartItems,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('LocalStorage error', e);
    }
  }
}
