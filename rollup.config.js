import typescript from 'rollup-plugin-ts';
import ttypescript from 'ttypescript';
import terser from '@rollup/plugin-terser';
import fs from 'node:fs';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs',
    preserveModules: true,
  },
  plugins: [
    typescript({
      typescript: ttypescript,
      tsconfig: resolvedConfig => ({
        ...resolvedConfig,
        declaration: true,
      }),
    }),
    terser(),
    {
      /**
       * Match the CommonJS runtime export and preserve augmentable payload types.
       */
      writeBundle() {
        const dtsFile = 'lib/index.d.ts';

        fs.copyFileSync('types/index.d.ts', dtsFile);
      }
    }
  ],
};
