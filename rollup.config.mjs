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
      // Library styles live in @layer so any unlayered consumer CSS wins,
      // whatever its specificity. That is the styling escape hatch: pass a
      // className and write plain (S)CSS — media queries included — exactly
      // like styling an app-local component. defisaver-app's global element
      // rules are class-scoped or benign (box-sizing, fonts), so yielding is
      // safe; components that would collide with the app's bare `a`/`input`
      // rules must deal with that explicitly when they're built.
      useCSSLayers: true,
      classNamePrefix: 'dsui-',
      unstable_moduleResolution: { type: 'commonJS', rootDir },
    }),
  ],
};
