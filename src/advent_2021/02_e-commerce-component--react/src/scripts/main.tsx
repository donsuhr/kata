import * as React from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/App/index.js';

const domNode = document.getElementById('root');
if (!domNode) {
  throw new Error('html missing root node');
}
const root = createRoot(domNode);

root.render(<App />);
