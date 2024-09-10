import * as React from 'react';
import { getItems } from '../../services/products.js';
import { STATUS } from '../../types.js';
const Context = /*#__PURE__*/React.createContext(null);
function Provider({
  children,
  initialStatus = null,
  initialItems = []
}) {
  const [items, setItems] = React.useState(initialItems);
  const [status, setStatus] = React.useState(initialStatus);
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
  const value = React.useMemo(() => ({
    items,
    setItems,
    status,
    setStatus
  }), [items, status]);
  return /*#__PURE__*/React.createElement(Context.Provider, {
    value: value
  }, children);
}
function useMenuState() {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error('useMenuState must be used within a Provider from MenuStateProvider');
  }
  return context;
}
export { Provider, useMenuState };