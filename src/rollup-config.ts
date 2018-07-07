import { InputOptions, OutputOptions } from 'rollup'
import { postcss } from './plugins/postcss'
import { terser } from './plugins/terser'
import { babel } from './plugins/babel'
import { node } from './plugins/node'
import { html } from './plugins/html'

export type RollupConfig = InputOptions & { output: OutputOptions }

interface Options {
  babelPresets: ({ isModule }: { isModule: boolean }) => any
  babelPlugins: ({ isModule }: { isModule: boolean }) => any
}

export const extensions = ['.mjs', '.js', '.json', '.ts', '.tsx', '.css']

export const createRollupConfig = (
  { babelPresets, babelPlugins }: Options,
  env: string,
) => {
  const development = env === 'development'

  const config: RollupConfig[] = [
    // Es modules code-split build
    {
      input: ['src/index.tsx'],
      experimentalCodeSplitting: true,
      output: {
        dir: 'dist',
        format: 'es',
      },
      plugins: [
        postcss({ development, extract: true }),
        babel({ babelPresets, babelPlugins, isModule: true }),
        node({ extensions }),
        html({
          filename: 'dist/index.html',
          scripts: {
            module: ['dist/index.js'],
            nomodule: ['dist/index.nomodule.js'],
          },
          stylesheets: ['dist/index.css'],
        }),
      ].concat(development ? [] : [terser({ isModule: true })]),
    },
  ]
  // Fallback iife build
  if (!development) {
    config.push({
      input: 'src/index.tsx',
      output: {
        name: 'nomodule',
        file: 'dist/index.nomodule.js',
        format: 'iife',
      },
      plugins: [
        postcss({ development, extract: true, write: false }),
        babel({ babelPresets, babelPlugins, isModule: true }),
        node({ extensions }),
        terser({ isModule: true }),
      ],
    })
  }
  return config
}
