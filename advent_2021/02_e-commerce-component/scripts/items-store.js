import { wait } from './utils.js';
import { STATUS } from './types.js';
const itemsDataUrl = './data.json';
let items = [];
let status = null;
let currentLoadPromise;
const load = () => {
  if (status === STATUS.LOADING) {
    return currentLoadPromise;
  }
  currentLoadPromise = new Promise((resolve, reject) => {
    status = STATUS.LOADING;
    wait().then(() => fetch(itemsDataUrl)).then(response => {
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      return response.json();
    }).then(json => {
      status = STATUS.SUCCESS;
      items = json.data;
      resolve(json.data);
    }).catch(e => {
      // eslint-disable-next-line no-console
      console.error('unable to fetch items data', e);
      status = STATUS.ERROR;
      reject(e);
    });
  });
  return currentLoadPromise;
};
const getItems = async () => {
  if (status !== STATUS.SUCCESS) {
    await load();
  }
  return items;
};
export { load, getItems };