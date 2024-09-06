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
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['*.cjs', '**/*.config.mjs'] },
    ],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
        },
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '#*/**',
            group: 'internal',
            position: 'before',
          },
        ],
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],
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
        project: './tsconfig.eslint.json',
      },

      rules: {
        'react/require-default-props': 'off',
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
