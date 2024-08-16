module.exports = {
  root: true,
  extends: [
    'airbnb',
    // 'plugin:react/recommended',
    'plugin:eslint-comments/recommended',
    // 'plugin:jest/recommended',
    // 'plugin:promise/recommended',
    // 'plugin:unicorn/recommended',
    'prettier',
    // 'prettier/react',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'no-case-declarations': 'off',
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint'],
      extends: [
        'airbnb-typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:react/recommended',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },

      rules: {
        'react/require-default-props': 'off',
      },
    },

    {
      files: ['*.js'],
      env: {
        node: true,
      },
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },

    {
      files: ['*.test.js'],
      plugins: ['jest'],
      env: {
        es6: true,
        node: true,
        'jest/globals': true,
      },
      extends: ['plugin:jest/recommended'],
      parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module',
      },
    },
  ],
};
