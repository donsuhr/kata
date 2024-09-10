import path from 'path';
import { fileURLToPath } from 'url';
import { getByLabelText } from '@testing-library/dom';
import { JSDOM } from 'jsdom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sut from './cart.js';
import { STATUS } from './types.js';

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/* eslint-enable @typescript-eslint/naming-convention, no-underscore-dangle */

const cart = [{
  id: 'item id',
  title: 'item title',
  price: 2.99,
  imageUrl: 'imageUrl.jpg',
  quantity: 2,
  status: STATUS.SUCCESS
}];
vi.mock('./cart-store', () => ({
  getItems: vi.fn(() => cart)
}));
describe('Cart', () => {
  beforeEach(async () => {
    const indexFile = path.resolve(__dirname, '../index.html');
    const dom = await JSDOM.fromFile(indexFile);
    const template = dom.window.document.documentElement.querySelector('#cart-item-template');
    const main = dom.window.document.documentElement.querySelector('main');
    if (!main) throw Error('<main>element not found in index.html');
    if (!template) throw Error('<template>element not found in index.html');
    document.body.appendChild(main);
    document.body.appendChild(template);
  });
  it('renders a quantity', () => {
    const container = sut.renderList();
    const quantityEl = getByLabelText(container, 'quantity');
    expect(quantityEl.textContent).toBe(String(cart[0].quantity));
  });
  it('renders a price', () => {
    const container = sut.renderList();
    const quantityEl = getByLabelText(container, 'single item price');
    expect(quantityEl.textContent).toBe(`$${cart[0].price}`);
  });
  it('renders a total price', () => {
    const container = sut.renderList();
    const quantityEl = getByLabelText(container, 'total price for item');
    expect(quantityEl.textContent).toBe(`$${cart[0].quantity * cart[0].price}`);
  });
});