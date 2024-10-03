import { addItem, dispatcher, hasItemById, UPDATE } from './cart-store.js';
import { getItems as getMenuItems } from './items-store.js';
import { formatDollars } from './utils.js';

const CONTAINER_SELECTOR = '.menu-list';

const getContainerEl = () => {
  const el = document.querySelector<HTMLElement>(CONTAINER_SELECTOR);
  if (!el) {
    throw new Error(`menu  missing required element '${CONTAINER_SELECTOR}'`);
  }
  return el;
};

const renderLoading = () => {
  getContainerEl().innerHTML = '<p class="menu__loading">Loading...</p>';
};

const renderList = async () => {
  const items = await getMenuItems();
  const fragments = items.map((item) => {
    const inCart = hasItemById(item.id);
    const CTA = inCart
      ? '<div class="menu-list-item__in-cart"><img src="./images/check.svg" alt=""/>In Cart</div>'
      : `<button class="menu-list-item__add-to-cart" type="button" data-id="${item.id}">
             Add to Cart
          </button>`;

    return `<li class="menu-list-item">
        <img src="${item.imageUrl}" class="menu-list-item__img" />
        <div class="menu-list-item__content">
          <h2 class="menu-list-item__title">${item.title}</h2>
          <p class="menu-list-item__price">${formatDollars(item.price)}</p>
          ${CTA}
         </div>
       </li>`;
  });

  const newUlEl = document.createElement('ul');
  newUlEl.setAttribute('class', 'menu-list');
  newUlEl.innerHTML = fragments.join('');

  getContainerEl().innerHTML = fragments.join('');
};

const init = async () => {
  renderLoading();
  await renderList();

  getContainerEl().addEventListener('click', (event) => {
    // fire-and-forget
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const target = event.target as HTMLButtonElement | null;
      if (target?.tagName !== 'BUTTON' || !Object.hasOwn(target?.dataset, 'id'))
        return;
      const { id } = target.dataset;
      const items = await getMenuItems();
      const item = items.find((menuItem) => menuItem.id === id);
      if (item) {
        target.classList.toggle('loading', true);
        await addItem(item);
        target.classList.toggle('loading', false);
      }
    })();
  });

  dispatcher.addEventListener(UPDATE, () => {
    // fire-and-forget
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      await renderList();
    })();
  });
};

export { init, renderList };
