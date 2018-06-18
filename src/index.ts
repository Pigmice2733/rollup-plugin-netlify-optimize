import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import htmlPlugin, { Routes } from './html-plugin'
import { InputOptions, OutputOptions } from 'rollup'

type RollupConfig = InputOptions & { output: OutputOptions }

interface Options {
  babelConfig: any
  routes: Routes
}

export const createRollupConfig = (
  { babelConfig, routes }: Options,
  env: string,
) => {
  const development = env === 'development'
  const prodPlugins = [
    terser({
      module: true,
      compress: {
        passes: 2,
        unsafe_comps: true,
        unsafe_math: true,
      },
    }),
  ]
  const config: RollupConfig = {
    input: ['src/index.tsx'],
    experimentalCodeSplitting: true,
    output: {
      dir: 'dist',
      format: 'es',
    },
    plugins: [
      postcss({
        extract: 'dist/index.css',
        minimize: true,
        modules: {
          generateScopedName: development
            ? '[local]-[hash:base64:4]'
            : '[hash:base64:4]',
        },
      }),
      babel({ babelrc: false, ...babelConfig }),
      nodeResolve({
        jsnext: true,
        extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.css'],
      }),
      htmlPlugin({ routes, entryStyles: ['index.css'] }),
    ].concat(development ? [] : prodPlugins),
  }
  return config
}
