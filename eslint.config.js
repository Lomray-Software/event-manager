const lomrayConfig = require('@lomray/eslint-config').default;
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'lib/**', 'coverage/**', 'src/@types/**'] },
  ...lomrayConfig.config({
    files: ['src/**/*.ts', '__tests__/**/*.ts', '__helpers__/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node, NodeJS: true },
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    settings: {
      'import-x/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-await-in-loop': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  }),
  {
    files: ['__tests__/**/*.ts', '__helpers__/**/*.ts'],
    rules: {
      'sonarjs/no-duplicate-string': 'off',
      // Vitest convention directories are wrapped in double underscores.
      'unicorn/filename-case': 'off',
    },
  },
];
