import * as React from 'react';

import { FoodMenuItem, getItems } from '../../services/products.js';
import { STATUS, Status } from '../../types.js';

type ProviderProps = {
  children: React.ReactNode;
  initialStatus?: ProviderContextType['status'];
  initialItems?: ProviderContextType['items'];
};

type ProviderContextType = {
  items: FoodMenuItem[];
  setItems: React.Dispatch<React.SetStateAction<FoodMenuItem[]>>;
  status: Status | null;
  setStatus: React.Dispatch<React.SetStateAction<Status | null>>;
};

const Context = React.createContext<ProviderContextType | null>(null);

function Provider({
  children,
  initialStatus = null,
  initialItems = [],
}: ProviderProps) {
  const [items, setItems] =
    React.useState<ProviderContextType['items']>(initialItems);
  const [status, setStatus] =
    React.useState<ProviderContextType['status']>(initialStatus);

  React.useEffect(() => {
    // fire-and-forget
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        setStatus(STATUS.LOADING);
        const loadedItems = await getItems();
        setItems(loadedItems);
        setStatus(STATUS.SUCCESS);
      } catch (e) {
        setStatus(STATUS.ERROR);
      }
    })();
  }, []);

  const value = React.useMemo(
    () => ({ items, setItems, status, setStatus }),
    [items, status],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function useMenuState() {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      'useMenuState must be used within a Provider from MenuStateProvider',
    );
  }
  return context;
}

export { Provider, useMenuState };
