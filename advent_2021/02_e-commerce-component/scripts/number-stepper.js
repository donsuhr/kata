const getCurrentValue = el => {
  if (el.type === 'number') {
    return el.valueAsNumber;
  }
  return parseInt(el.value, 10);
};
const render = ({
  value = 0,
  step = 1,
  min = 0,
  size = 2,
  className = ''
} = {}) => {
  const wrapperEl = document.createElement('div');
  wrapperEl.className = `number-stepper ${className}`;
  const abortController = new AbortController();
  const valueEl = document.createElement('input');
  valueEl.type = 'number';
  valueEl.className = 'number-stepper-input';
  valueEl.valueAsNumber = value;
  valueEl.step = String(step);
  valueEl.size = size;
  valueEl.min = String(min);
  const increaseEl = document.createElement('button');
  increaseEl.type = 'button';
  increaseEl.className = 'number-stepper-button';
  increaseEl.dataset.direction = 'increase';
  increaseEl.addEventListener('click', () => {
    valueEl.value = String(getCurrentValue(valueEl) + 1);
    const changeEvent = new Event('change', {
      bubbles: true
    });
    valueEl.dispatchEvent(changeEvent);
  }, {
    signal: abortController.signal,
    passive: true
  });
  const decreaseEl = document.createElement('button');
  decreaseEl.type = 'button';
  decreaseEl.className = 'number-stepper-button';
  decreaseEl.dataset.direction = 'decrease';
  decreaseEl.addEventListener('click', () => {
    valueEl.value = String(getCurrentValue(valueEl) - 1);
    const changeEvent = new Event('change', {
      bubbles: true
    });
    valueEl.dispatchEvent(changeEvent);
  }, {
    signal: abortController.signal,
    passive: true
  });
  wrapperEl.replaceChildren(decreaseEl, valueEl, increaseEl);
  return {
    el: wrapperEl,
    destroy: () => abortController.abort()
  };
};
export { render };