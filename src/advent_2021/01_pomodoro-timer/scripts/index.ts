import { timer } from './timer.js';

document
  .querySelectorAll('.timer')
  .forEach((timerEl) => timer(timerEl as HTMLElement));
