import { STATUS } from './types.js';
import { wait, debouncePromise } from './utils.js';
const TAX_RATE = 0.0975;
const UPDATE = 'update';
const LS_CART_KEY = 'kata_cart';
let store = [];
const dispatcher = document.createElement('div');
const getTotals = () => {
  const subTotal = store.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxTotal = subTotal * TAX_RATE;
  const total = subTotal + taxTotal;
  return {
    total,
    taxTotal,
    subTotal
  };
};
const getItems = () => store;
const dispatchUpdate = () => {
  const event = new CustomEvent(UPDATE);
  dispatcher.dispatchEvent(event);
};
const writeToLocalStorage = async () => {
  const values = store.map(({
    id,
    quantity
  }) => ({
    id,
    quantity
  }));
  try {
    store = store.map(item => ({
      ...item,
      status: item.status === STATUS.DIRTY ? STATUS.LOADING : item.status
    }));
    dispatchUpdate();
    await wait();
    localStorage.setItem(LS_CART_KEY, JSON.stringify(values));
    store = store.map(item => ({
      ...item,
      status: item.status !== STATUS.SUCCESS ? STATUS.SUCCESS : item.status
    }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('LocalStorage error', e);
    store = store.map(item => ({
      ...item,
      status: item.status === STATUS.LOADING ? STATUS.ERROR : item.status
    }));
  } finally {
    dispatchUpdate();
  }
};
const debouncedWrite = debouncePromise(writeToLocalStorage);
const getItemById = id => store.find(cartItem => cartItem.id === id);
const removeById = async (id, persist = true) => {
  store = store.filter(item => item.id !== id);
  if (persist) {
    await writeToLocalStorage();
  }
  dispatchUpdate();
};
const updateById = async (id, quantity, persist = true) => {
  const item = getItemById(id);
  if (item) {
    if (quantity === 0) {
      await removeById(id, persist);
    } else {
      item.quantity = quantity;
      item.status = STATUS.DIRTY;
      dispatchUpdate();
      if (persist) {
        await debouncedWrite();
      }
    }
  } else {
    throw new Error(`unable to find item in cart store with id: ${id}`);
  }
};
const addItem = async (item, quantity = 1, persist = true) => {
  const existingItem = getItemById(item.id);
  if (existingItem) {
    await updateById(existingItem.id, existingItem.quantity + quantity, persist);
  } else {
    const status = persist ? STATUS.DIRTY : STATUS.SUCCESS;
    store.push({
      ...item,
      quantity,
      status
    });
    dispatchUpdate();
    if (persist) {
      await writeToLocalStorage();
    }
  }
};
const restoreFromLocalStorage = async menuItems => {
  try {
    const values = JSON.parse(localStorage.getItem(LS_CART_KEY) ?? '[]');
    await Promise.all(values.map(async localStorageItem => {
      const menuItem = menuItems.find(item => item.id === localStorageItem.id);
      if (menuItem) {
        return addItem(menuItem, localStorageItem.quantity, false);
      }
      // eslint-disable-next-line no-console
      console.warn(`LocalStorage item with id ${localStorageItem.id} not found in menu items`);
      return Promise.resolve();
    }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('LocalStorage error', e);
  }
};
const hasItemById = id => store.some(cartItem => cartItem.id === id);
export { UPDATE, addItem, dispatcher, getItems, getTotals, hasItemById, restoreFromLocalStorage, updateById };