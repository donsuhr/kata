import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { load, getItems, FoodMenuItem } from './products.js';

let origFetch: typeof global.fetch;
let mockFetch: jest.MockedFunction<typeof global.fetch>;

const data: FoodMenuItem[] = [
  { id: '1', title: 'target title', price: 2.09, imageUrl: 'xxx.jpg' },
];

const typicalResponse: Response = {
  ok: true,
  status: 200,
  json: () =>
    new Promise((resolve) => {
      resolve({
        data,
      });
    }),
} as Response;

describe('products', () => {
  beforeAll(() => {
    origFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.fetch = origFetch;
  });

  beforeEach(() => {
    mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;
    mockFetch.mockResolvedValue(typicalResponse);
  });

  it('loads', async () => {
    const items = await getItems();
    expect(items).toEqual(data);
  });

  it('calling it twice returns the same promise', () => {
    const promise1 = load();
    const promise2 = load();
    expect(promise1).toBe(promise2);
  });

  it('rejects if the response is not ok', async () => {
    global.console.error = vi.fn();
    const response = { ...typicalResponse, ok: false, status: 401 };
    mockFetch.mockResolvedValue(response);
    await expect(() => load()).rejects.toThrow(/response error fetching/i);
    /* eslint-disable no-console */
    expect(console.error).toHaveBeenCalled();
    (
      console.error as jest.MockedFunction<typeof global.console.error>
    ).mockRestore();
    /* eslint-enable no-console */
  });
});
