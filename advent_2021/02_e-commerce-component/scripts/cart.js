import * as Store from './cart-store.js';
import { render as renderSteppers } from './number-stepper.js';
import { STATUS } from './types.js';
import { formatDollars } from './utils.js';
const SUBTOTAL_SELECTOR = '#CartSubTotal';
const TOTAL_SELECTOR = '#CartTotal';
const TAX_TOTAL_SELECTOR = '#CartTaxTotal';
const CONTAINER_SELECTOR = '.cart-list';
const childrenRequiringCleanup = new Map();
const getContainerEl = () => {
  const el = document.querySelector(CONTAINER_SELECTOR);
  if (!el) {
    throw new Error(`menu  missing required element '${CONTAINER_SELECTOR}'`);
  }
  return el;
};
const updateDisplayTotals = () => {
  const subTotalEl = document.querySelector(SUBTOTAL_SELECTOR);
  if (!subTotalEl) {
    throw new Error(`Cart missing required element '${SUBTOTAL_SELECTOR}'`);
  }
  const totalEl = document.querySelector(TOTAL_SELECTOR);
  if (!totalEl) {
    throw new Error(`Cart missing required element '${TOTAL_SELECTOR}'`);
  }
  const taxTotalEl = document.querySelector(TAX_TOTAL_SELECTOR);
  if (!taxTotalEl) {
    throw new Error(`Cart missing required element '${TAX_TOTAL_SELECTOR}'`);
  }
  const {
    total,
    taxTotal,
    subTotal
  } = Store.getTotals();
  subTotalEl.innerText = formatDollars(subTotal);
  totalEl.innerText = formatDollars(total);
  taxTotalEl.innerText = formatDollars(taxTotal);
};
export const renderList = () => {
  childrenRequiringCleanup.forEach((cleanUpFn, key) => {
    cleanUpFn();
    childrenRequiringCleanup.delete(key);
  });
  const liElements = Store.getItems().map(item => {
    const {
      el: quantityControlEl,
      destroy: teardownFn
    } = renderSteppers({
      value: item.quantity,
      min: 1,
      className: 'cart-list__quantity-control'
    });
    childrenRequiringCleanup.set(quantityControlEl, teardownFn);
    const totalPrice = formatDollars(item.price * item.quantity);
    const statusIcons = new Map([[STATUS.DIRTY, '⌛️'], [STATUS.LOADING, '🔄'], [STATUS.SUCCESS, ''], [STATUS.ERROR, '⚠️']]);
    const status = statusIcons.get(item.status) ?? '🔪';
    const getTemplateElement = (parentEl, selector) => {
      const el = parentEl.querySelector(selector);
      if (!el) {
        throw new Error(`Cart template missing required element '${selector}'`);
      }
      return el;
    };
    const templateEl = getTemplateElement(document, '#cart-item-template');
    const liEl = templateEl.content.cloneNode(true).firstElementChild;
    liEl.dataset.id = item.id;
    const imgEl = getTemplateElement(liEl, '.cart-list__item-img');
    imgEl?.setAttribute('src', item.imageUrl);
    const quantityEl = getTemplateElement(liEl, '.cart-list__item-current-quantity');
    quantityEl.textContent = String(item.quantity);
    const titleEl = getTemplateElement(liEl, '.cart-list__item-title');
    titleEl.textContent = item.title;
    const priceEl = getTemplateElement(liEl, '.cart-list__item-price');
    priceEl.textContent = formatDollars(item.price);
    const statusEl = getTemplateElement(liEl, '.cart-list__item-status');
    statusEl.textContent = status;
    const totalPriceEl = getTemplateElement(liEl, '.cart-list__total-price');
    totalPriceEl.textContent = totalPrice;
    const quantityControlElContainer = getTemplateElement(liEl, '.cart-list__quantity-control-target');
    quantityControlElContainer.replaceWith(quantityControlEl);
    return liEl;

    // return wrapperEl;
  });
  const container = getContainerEl();
  container.replaceChildren(...liElements);
  return container;
};
const addListeners = () => {
  Store.dispatcher.addEventListener(Store.UPDATE, () => {
    updateDisplayTotals();
    renderList();
  });
  getContainerEl().addEventListener('change', event => {
    const target = event.target;
    const wrapper = target.closest('[data-id]');
    const {
      id
    } = wrapper.dataset;
    const {
      valueAsNumber: quantity
    } = target;
    if (id) {
      // fire-and-forget
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        await Store.updateById(id, quantity);
      })();
    }
  });
};
const init = () => {
  updateDisplayTotals();
  addListeners();
};
export { init };