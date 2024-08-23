
export const STATUS = {
  DIRTY: 'dirty',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

type StatusType = typeof STATUS;
export type Status = StatusType[keyof StatusType];

