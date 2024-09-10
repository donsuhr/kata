import * as Store from './cart-store.js';
import { render as renderSteppers } from './number-stepper.js';
import { STATUS, Status } from './types.js';
import { formatDollars } from './utils.js';

const SUBTOTAL_SELECTOR = '#CartSubTotal';
const TOTAL_SELECTOR = '#CartTotal';
const TAX_TOTAL_SELECTOR = '#CartTaxTotal';
const CONTAINER_SELECTOR = '.cart-list';

const childrenRequiringCleanup = new Map<HTMLElement, () => void>();

const getContainerEl = () => {
  const el = document.querySelector<HTMLElement>(CONTAINER_SELECTOR);
  if (!el) {
    throw new Error(`menu  missing required element '${CONTAINER_SELECTOR}'`);
  }
  return el;
};

const updateDisplayTotals = () => {
  const subTotalEl = document.querySelector<HTMLElement>(SUBTOTAL_SELECTOR);
  if (!subTotalEl) {
    throw new Error(`Cart missing required element '${SUBTOTAL_SELECTOR}'`);
  }

  const totalEl = document.querySelector<HTMLElement>(TOTAL_SELECTOR);
  if (!totalEl) {
    throw new Error(`Cart missing required element '${TOTAL_SELECTOR}'`);
  }

  const taxTotalEl = document.querySelector<HTMLElement>(TAX_TOTAL_SELECTOR);
  if (!taxTotalEl) {
    throw new Error(`Cart missing required element '${TAX_TOTAL_SELECTOR}'`);
  }

  const { total, taxTotal, subTotal } = Store.getTotals();

  subTotalEl.innerText = formatDollars(subTotal);
  totalEl.innerText = formatDollars(total);
  taxTotalEl.innerText = formatDollars(taxTotal);
};

export const renderList = () => {
  childrenRequiringCleanup.forEach((cleanUpFn, key) => {
    cleanUpFn();
    childrenRequiringCleanup.delete(key);
  });

  const liElements = Store.getItems().map((item) => {
    const { el: quantityControlEl, destroy: teardownFn } = renderSteppers({
      value: item.quantity,
      min: 1,
      className: 'cart-list__quantity-control',
    });
    childrenRequiringCleanup.set(quantityControlEl, teardownFn);
    const totalPrice = formatDollars(item.price * item.quantity);
    const statusIcons = new Map<Status, string>([
      [STATUS.DIRTY, '⌛️'],
      [STATUS.LOADING, '🔄'],
      [STATUS.SUCCESS, ''],
      [STATUS.ERROR, '⚠️'],
    ]);
    const status = statusIcons.get(item.status) ?? '🔪';

    const getTemplateElement = <T>(
      parentEl: HTMLElement | Document,
      selector: string,
    ): T => {
      const el = parentEl.querySelector(selector);

      if (!el) {
        throw new Error(`Cart template missing required element '${selector}'`);
      }
      return el as T;
    };

    const templateEl = getTemplateElement<HTMLTemplateElement>(
      document,
      '#cart-item-template',
    );

    const liEl = <HTMLLIElement>(
      (<HTMLElement>templateEl.content.cloneNode(true)).firstElementChild
    );
    liEl.dataset.id = item.id;
    const imgEl = getTemplateElement<HTMLImageElement>(
      liEl,
      '.cart-list__item-img',
    );
    imgEl?.setAttribute('src', item.imageUrl);
    const quantityEl = getTemplateElement<HTMLDivElement>(
      liEl,
      '.cart-list__item-current-quantity',
    );
    quantityEl.textContent = String(item.quantity);
    const titleEl = getTemplateElement<HTMLHeadingElement>(
      liEl,
      '.cart-list__item-title',
    );
    titleEl.textContent = item.title;
    const priceEl = getTemplateElement<HTMLDivElement>(
      liEl,
      '.cart-list__item-price',
    );
    priceEl.textContent = formatDollars(item.price);
    const statusEl = getTemplateElement<HTMLDivElement>(
      liEl,
      '.cart-list__item-status',
    );
    statusEl.textContent = status;
    const totalPriceEl = getTemplateElement<HTMLDivElement>(
      liEl,
      '.cart-list__total-price',
    );
    totalPriceEl.textContent = totalPrice;
    const quantityControlElContainer = getTemplateElement<HTMLDivElement>(
      liEl,
      '.cart-list__quantity-control-target',
    );
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
  getContainerEl().addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    const wrapper = target.closest('[data-id]') as HTMLElement;
    const { id } = wrapper.dataset;
    const { valueAsNumber: quantity } = target;
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
