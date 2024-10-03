import { restoreFromLocalStorage } from './cart-store.js';
import { init as initCart } from './cart.js';
import { getItems } from './items-store.js';
import { init as initMenu } from './menu.js';

initCart();
await initMenu();
const menuItems = await getItems();
await restoreFromLocalStorage(menuItems);
