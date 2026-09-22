const fs = require('node:fs');
const terser = require('@rollup/plugin-terser');
const typescript = require('@rollup/plugin-typescript');

module.exports = {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs',
    preserveModules: true,
    exports: 'auto',
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.build.json' }),
    terser(),
    {
      name: 'copy-public-declaration',
      /**
       * Match the CommonJS runtime export and preserve augmentable payload types.
       */
      writeBundle() {
        const dtsFile = 'lib/index.d.ts';

        fs.copyFileSync('types/index.d.ts', dtsFile);
      },
    },
  ],
};
