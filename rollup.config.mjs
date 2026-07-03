import path from 'node:path';
import { fileURLToPath } from 'node:url';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import stylexPlugin from '@stylexjs/rollup-plugin';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
  // Bundle only our own source; every bare import (react, @stylexjs/stylex)
  // stays a regular runtime import in the published output.
  external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
  plugins: [
    nodeResolve({ extensions: ['.ts', '.tsx', '.js'] }),
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: false,
      emitDeclarationOnly: false,
    }),
    stylexPlugin({
      fileName: 'styles.css',
      // The :not(#\#) specificity bump makes library styles reliably beat the
      // consumer app's unlayered global CSS; @layer would instead lower them.
      useCSSLayers: false,
      classNamePrefix: 'dsui-',
      unstable_moduleResolution: { type: 'commonJS', rootDir },
    }),
  ],
};
