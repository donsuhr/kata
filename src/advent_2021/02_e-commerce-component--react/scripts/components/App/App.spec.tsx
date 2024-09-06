import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect } from 'vitest';

import App from './index.js';

describe('App', () => {
  it('renders has a menu and a cart', () => {
    render(<App />);

    const menuHeader = screen.getByText('To Go Menu');
    expect(menuHeader).toBeInTheDocument();

    const cartHeader = screen.getByText('Your Cart');
    expect(cartHeader).toBeInTheDocument();
  });
});
