import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import commentLength from 'eslint-plugin-comment-length';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'game/**',
      'worlds/**',
      'assets/**',
      'reference/**',
      'test-data/**',
      '.tmp-tests/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  {
    files: ['dev/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
  },

  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
      },
    },
  },

  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    plugins: { 'comment-length': commentLength },
    rules: {
      'comment-length/limit-single-line-comments': ['warn', { maxLength: 120, tabSize: 2 }],
      'comment-length/limit-multi-line-comments': ['warn', { maxLength: 120, tabSize: 2 }],
    },
  },

  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    rules: {
      'no-unused-vars': 'off',
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];
