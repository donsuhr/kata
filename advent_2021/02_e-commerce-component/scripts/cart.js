import { render as renderSteppers } from './number-stepper.js';
import { formatDollars } from './utils.js';
import * as Store from './cart-store.js';
import { STATUS } from './types.js';
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
const renderList = () => {
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
    const wrapperEl = document.createElement('li');
    wrapperEl.className = 'cart-list__item';
    wrapperEl.dataset.id = item.id;
    wrapperEl.innerHTML = `
            <div class="cart-list__img-wrapper">
              <img
                class="cart-list__item-img"
                src="${item.imageUrl}"
              />
              <div class="cart-list__item-current-quantity">${item.quantity}</div>
            </div>

            <h2 class="cart-list__item-title">${item.title}</h2>
            <div class="cart-list__item-price">${formatDollars(item.price)}</div>
            <div class="cart-list__item-status"> ${status}</div>
            <div class="cart-list__quantity-control-target"></div>
            </div>
            <div class="cart-list__total-price">${totalPrice}</div>
          </li>
          `;
    const quantityControlElContainer = wrapperEl.querySelector('.cart-list__quantity-control-target');
    if (!quantityControlElContainer) {
      throw new Error("Cart missing required element '.cart-list__quantity-control-target'");
    }
    quantityControlElContainer.replaceWith(quantityControlEl);
    return wrapperEl;
  });
  getContainerEl().replaceChildren(...liElements);
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