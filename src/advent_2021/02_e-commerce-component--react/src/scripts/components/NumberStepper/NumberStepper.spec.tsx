import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';

import NumberStepper from './NumberStepper.js';

describe('NumberStepper', () => {
  it('renders an input with value', () => {
    render(<NumberStepper value={2} label="foo" />);
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('emits a +1 value clicking increase', () => {
    const mock = vi.fn();
    render(<NumberStepper value={2} onChange={mock} label="foo" />);
    const button = screen.queryByLabelText(/increase/i);
    if (!button) throw Error('decrease button not in dom');
    fireEvent.click(button);
    expect(mock).toHaveBeenCalledWith(3);
  });

  it('emits a -1 value clicking increase', () => {
    const mock = vi.fn();
    render(<NumberStepper value={2} onChange={mock} label="foo" />);
    const button = screen.queryByLabelText(/decrease/i);
    if (!button) throw Error('decrease button not in dom');
    fireEvent.click(button);
    expect(mock).toHaveBeenCalledWith(1);
  });

  it('does not change the value if its not a positive number', () => {
    render(<NumberStepper value={2} label="targetInput" />);
    const input: HTMLInputElement | null =
      screen.queryByLabelText('targetInput');
    if (!input) throw Error('input control not in dom');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input.value).toBe('2');
    fireEvent.change(input, { target: { value: '44' } });
    expect(input.value).toBe('44');
  });

  it('triggers onchange from direct input', () => {
    const mock = vi.fn();
    render(<NumberStepper value={2} label="targetInput" onChange={mock} />);
    const input: HTMLInputElement | null =
      screen.queryByLabelText('targetInput');
    if (!input) throw Error('input control not in dom');
    fireEvent.change(input, { target: { value: '44' } });
    expect(mock).toHaveBeenCalledWith(44);
  });
});
