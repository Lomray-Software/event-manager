const baseConfig = require('@lomray/eslint-config').default;
const globals = require('globals');

const customFilesIgnores = {
  ...baseConfig.filesIgnores,
  files: [
    ...baseConfig.filesIgnores.files,
    '__tests__/**/*.ts',
    '__helpers__/**/*.ts',
  ],
};

module.exports = [
  { ignores: ['node_modules/**', 'lib/**', 'coverage/**', 'src/@types/**'] },
  ...baseConfig.config(customFilesIgnores),
  {
    ...customFilesIgnores,
    languageOptions: {
      globals: {
        ...globals.node,
        NodeJS: true,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-await-in-loop': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
];
