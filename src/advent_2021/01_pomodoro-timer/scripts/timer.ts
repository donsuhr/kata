const timer = ($el: HTMLElement) => {
  let timerId: ReturnType<typeof setInterval>;
  let actualPlayTime: number;
  let userInputTime: number;
  let pauseRemainingMs: number | null;

  const viewStopped = 'stopped';
  const viewPaused = 'paused';
  const viewPlaying = 'playing';
  const viewEditing = 'editing';

  type ViewState =
    | typeof viewStopped
    | typeof viewPaused
    | typeof viewPlaying
    | typeof viewEditing;

  const $minutes = $el.querySelector<HTMLInputElement>(
    '.timer__input--minutes',
  );
  const $seconds = $el.querySelector<HTMLInputElement>(
    '.timer__input--seconds',
  );
  const $inputWrapper = $el.querySelector<HTMLElement>('.timer__input-wrapper');
  const $configBtn = $el.querySelector<HTMLButtonElement>(
    '.timer__config-button',
  );
  const $startBtn = $el.querySelector<HTMLButtonElement>(
    '.timer__start-button',
  );

  const getInputTime = () =>
    (parseInt($seconds?.value ?? '0', 10) +
      parseInt($minutes?.value ?? '0', 10) * 60) *
    1000;

  const updateInputValue = ($input: HTMLInputElement | null, value: number) => {
    if ($input) {
      // eslint-disable-next-line no-param-reassign
      $input.value = value.toString().padStart(2, '0');
    }
  };

  const getRemainingMs = () =>
    (pauseRemainingMs ?? userInputTime) - (Date.now() - actualPlayTime);

  const checkZero = () => {
    if (getInputTime() <= 0) {
      clearInterval(timerId);

      setTimeout(() => {
        const newMinutes = Math.floor(userInputTime / 1000 / 60);
        const newSeconds = (userInputTime / 1000) % 60;
        updateInputValue($minutes, newMinutes);
        updateInputValue($seconds, newSeconds);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        updateViewState(viewStopped);
        document.documentElement.style.setProperty('--dataStrokeOffset', '0');
      }, 750);
    }
  };

  const play = () => {
    actualPlayTime = Date.now();
    const intervalFunction = () => {
      const remainingMs = getRemainingMs();
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      const newMinutes = Math.floor(remainingSeconds / 60);
      const newSeconds = remainingSeconds % 60;
      updateInputValue($minutes, newMinutes);
      updateInputValue($seconds, newSeconds);
      const percent = Math.max(
        0,
        Math.min(100, 100 - (remainingMs / userInputTime) * 100),
      );
      document.documentElement.style.setProperty(
        '--dataStrokeOffset',
        percent.toString(),
      );

      checkZero();
    };

    intervalFunction();
    timerId = setInterval(intervalFunction, 250);
  };

  const updateViewState = (state: ViewState) => {
    if ($minutes) {
      $minutes.readOnly = true;
    }
    if ($seconds) {
      $seconds.readOnly = true;
    }

    if ($startBtn) {
      $startBtn.textContent = 'start';
    }
    switch (state) {
      case viewPlaying:
        play();
        if ($startBtn) {
          $startBtn.textContent = 'pause';
        }
        break;

      case viewEditing:
        clearInterval(timerId);
        if ($minutes) {
          $minutes.readOnly = false;
          $minutes.select();
        }
        if ($seconds) {
          $seconds.readOnly = false;
        }
        if ($startBtn) {
          $startBtn.textContent = 'start';
        }
        break;

      case viewPaused:
        pauseRemainingMs = getRemainingMs();
        clearInterval(timerId);
        break;

      case viewStopped:
        pauseRemainingMs = null;
        clearInterval(timerId);
        break;

      default:
        break;
    }
    // eslint-disable-next-line no-param-reassign
    $el.dataset.state = state;
  };

  $inputWrapper?.addEventListener('change', (event: Event) => {
    if (event) {
      const target = event.target as HTMLInputElement;
      const value = Math.min(
        parseInt(target?.max, 10),
        parseInt(target.value, 10),
      );
      updateInputValue(target, value);
    }
    userInputTime = getInputTime();
    pauseRemainingMs = null;
  });

  $inputWrapper?.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowRight') {
      if (event.target === $minutes && $seconds) {
        $seconds.focus();
      }
    } else if (event.code === 'ArrowLeft') {
      if (event.target === $seconds && $minutes) {
        $minutes.focus();
      }
    }
  });

  $configBtn?.addEventListener('click', () => {
    const isEditing = $el.dataset.state === viewEditing;
    if (isEditing) {
      updateViewState(viewStopped);
    } else {
      updateViewState(viewEditing);
    }
  });

  $startBtn?.addEventListener('click', () => {
    const isPlaying = $el.dataset.state === viewPlaying;
    if (isPlaying) {
      updateViewState(viewPaused);
    } else {
      updateViewState(viewPlaying);
    }
  });

  userInputTime = getInputTime();
};

export { timer };
