import { STATUS, Status } from './types.js';
import { wait } from './utils.js';

export type FoodMenuItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
};

type JSONResponse = {
  data: FoodMenuItem[];
};

const itemsDataUrl = './data.json';

let items: FoodMenuItem[] = [];
let status: Status | null = null;
let currentLoadPromise: Promise<FoodMenuItem[]>;

const load = (): Promise<FoodMenuItem[]> => {
  if (status === STATUS.LOADING) {
    return currentLoadPromise;
  }
  currentLoadPromise = new Promise<FoodMenuItem[]>((resolve, reject) => {
    status = STATUS.LOADING;
    wait()
      .then(() => fetch(itemsDataUrl))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        return response.json();
      })
      .then((json: JSONResponse) => {
        status = STATUS.SUCCESS;
        items = json.data;
        resolve(json.data);
      })
      .catch((e) => {
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
