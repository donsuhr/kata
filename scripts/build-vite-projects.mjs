import { spawn } from 'child_process';

spawn(
  './node_modules/.bin/vite',
  [
    'build',
    './src/advent_2021/02_e-commerce-component--react',
    '--outDir=../../../dist/kata/advent_2021/02_e-commerce-component--react',
    '--base=./',
  ],
  { stdio: 'inherit' },
);
