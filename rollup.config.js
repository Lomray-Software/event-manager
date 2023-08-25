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
       * Fix
       * @see https://github.com/microsoft/TypeScript/issues/49536
       */
      writeBundle() {
        const dtsFile = 'lib/index.d.ts';
        const dts = fs.readFileSync(dtsFile, { encoding: 'utf-8' });

        fs.writeFileSync(dtsFile, dts.replaceAll('TChannel extends string', 'TChannel extends TEventsKeys'), { encoding: 'utf-8' });
      }
    }
  ],
};
