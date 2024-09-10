import * as React from 'react';
import styles from './NumberStepper.module.css';
export default function NumberStepper({
  value = 0,
  step = 1,
  min = 0,
  size = 2,
  label,
  onChange
}) {
  const [val, setVal] = React.useState(value);
  const handleButtonClick = event => {
    const direction = event.currentTarget.dataset.direction === 'increase' ? 1 : -1;
    const newVal = val + direction;
    if (newVal >= min) {
      setVal(val + direction);
      if (onChange) {
        onChange(val + direction);
      }
    }
  };
  const handleInputChange = event => {
    const newVal = parseInt(event.target.value, 10);
    if (newVal >= min) {
      setVal(newVal);
      if (onChange) {
        onChange(newVal);
      }
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: styles.numberStepper
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: styles.button,
    "data-direction": "decrease",
    onClick: handleButtonClick,
    "aria-label": `decrease value by ${step}`
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: styles.input,
    step: step,
    size: size,
    min: min,
    value: val,
    onChange: handleInputChange,
    "aria-label": label
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: styles.button,
    "data-direction": "increase",
    onClick: handleButtonClick,
    "aria-label": `increase value by ${step}`
  }));
}