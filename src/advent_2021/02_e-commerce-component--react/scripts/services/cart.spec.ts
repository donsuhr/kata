import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ACTIONS, CartItem } from '../components/Cart/CartStateProvider.js';
import { STATUS } from '../types.js';

import Persistance from './cart.js';

let origLocalStorage: typeof global.localStorage;
const mockLocalStorage = {
  clear: vi.fn(),
  length: 0,
  getItem: vi.fn(),
  setItem: vi.fn(),
  key: vi.fn(),
  removeItem: vi.fn(),
};

const typicalCart: CartItem[] = [
  {
    id: '0',
    title: '0',
    price: 0,
    imageUrl: '0',
    quantity: 1,
    status: STATUS.DIRTY,
  },
  {
    id: '1',
    title: '1',
    price: 1,
    imageUrl: '1',
    quantity: 1,
    status: STATUS.SUCCESS,
  },
];

describe('cart', () => {
  beforeAll(() => {
    origLocalStorage = global.localStorage;
    global.localStorage = mockLocalStorage;
  });

  afterAll(() => {
    global.localStorage = origLocalStorage;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('lets us know it started a save', async () => {
    const dispatch = vi.fn();
    const sut = new Persistance(dispatch);
    await sut.write(typicalCart);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ACTIONS.START_SAVE,
        payload: expect.objectContaining<CartItem>({
          ...typicalCart[0],
        }) as CartItem,
      }),
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledOnce();
    const serialized = JSON.stringify({ id: '0', quantity: 1 });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining(serialized),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ACTIONS.SAVE_SUCCESS,
        payload: expect.objectContaining<CartItem>({
          ...typicalCart[0],
        }) as CartItem,
      }),
    );
  });

  it('dispatches an error if LocalStorage fails', async () => {
    global.console.error = vi.fn();
    const dispatch = vi.fn();
    const sut = new Persistance(dispatch);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    mockLocalStorage.setItem.mockImplementation(() => {
      throw Error('foo error');
    });
    await sut.write(typicalCart);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ACTIONS.SAVE_ERROR,
        payload: expect.objectContaining<CartItem>({
          ...typicalCart[0],
        }) as CartItem,
      }),
    );
    /* eslint-disable no-console */
    expect(console.error).toHaveBeenCalled();
    (
      console.error as jest.MockedFunction<typeof global.console.error>
    ).mockRestore();
    /* eslint-enable no-console */
  });

  describe('restore', () => {
    it('logs a warn when a stored item is not available', () => {
      global.console.warn = vi.fn();
      const dispatch = vi.fn();
      mockLocalStorage.getItem.mockImplementation(() =>
        JSON.stringify([{ id: '3', quantity: 1 }]),
      );
      const sut = new Persistance(dispatch);
      sut.restore(typicalCart);
      /* eslint-disable no-console */
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('with id 3 not found'),
      );
      (
        console.warn as jest.MockedFunction<typeof global.console.warn>
      ).mockRestore();
      /* eslint-enable no-console */
    });

    it('calls dispatch with the items from the cart', () => {
      const dispatch = vi.fn();
      const sut = new Persistance(dispatch);
      mockLocalStorage.getItem.mockImplementation(() =>
        JSON.stringify([
          { id: '0', quantity: 1 },
          { id: '1', quantity: 1 },
        ]),
      );
      sut.restore(typicalCart);
      const expectedPayload = [
        { ...typicalCart[0], status: STATUS.SUCCESS },
        { ...typicalCart[1], status: STATUS.SUCCESS },
      ];
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ACTIONS.RESTORE_CART,
          payload: expectedPayload,
        }),
      );
    });

    it('logs an error if localstorage throws', () => {
      global.console.error = vi.fn();
      const dispatch = vi.fn();
      const sut = new Persistance(dispatch);
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
      mockLocalStorage.getItem.mockImplementation(() => {
        throw Error('foo error');
      });
      sut.restore(typicalCart);

      /* eslint-disable no-console */
      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/localstorage error/i),
        expect.anything(),
      );
      (
        console.error as jest.MockedFunction<typeof global.console.error>
      ).mockRestore();
      /* eslint-enable no-console */
    });

    it('returns an empty array when localstorage is empty', () => {
      const dispatch = vi.fn();
      const sut = new Persistance(dispatch);
      mockLocalStorage.getItem.mockImplementation(() => null);
      sut.restore(typicalCart);
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ACTIONS.RESTORE_CART,
          payload: [],
        }),
      );
    });
  });

  describe('debouncedWrite', () => {
    it('only calls write once', () => {
      const dispatch = vi.fn();
      vi.useFakeTimers();
      const sut = new Persistance(dispatch);
      expect(dispatch).not.toHaveBeenCalled();
      /* eslint-disable @typescript-eslint/no-floating-promises */
      sut.debouncedWrite(typicalCart);
      sut.debouncedWrite(typicalCart);
      sut.debouncedWrite(typicalCart);
      sut.debouncedWrite(typicalCart);
      /* eslint-enable @typescript-eslint/no-floating-promises */
      expect(dispatch).not.toHaveBeenCalled();
      vi.runAllTimers();
      expect(dispatch).toHaveBeenCalledOnce();
    });
  });
});
