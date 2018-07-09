import { InputOptions, OutputOptions } from 'rollup'
import { postcss } from './plugins/postcss'
import { terser } from './plugins/terser'
import { babel } from './plugins/babel'
import { node } from './plugins/node'
import { html } from './plugins/html'
import resolveCb, { AsyncOpts } from 'resolve'
import { promisify } from 'util'
import { join, relative } from 'path'
import { urlFile } from './url-file'
import { prerender } from './plugins/prerender'

const resolve = promisify<string, AsyncOpts>(resolveCb)

interface Routes {
  [key: string]: string
}

interface Options {
  routes: Routes
  babelPresets: ({ isModule }: { isModule: boolean }) => any
  babelPlugins: ({ isModule }: { isModule: boolean }) => any
}

/**
 * Reducer for turning array of arrays into an object,
 * opposite of object.entries
 */
const toObject = (obj: { [key: string]: any }, [k, v]: any[]) =>
  typeof k === 'string' ? { ...obj, [k]: v } : obj

const findModule = async (srcPath: string) => {
  const absolute = await resolve(srcPath, {
    extensions,
    basedir: join(process.cwd(), 'src'),
  })
  if (typeof absolute !== 'string') {
    return null
  }
  return relative(process.cwd(), absolute)
}

export const createInputs = async (routes: Routes) =>
  (await Promise.all(
    Object.entries(routes).map(async ([url, srcPath]) => [
      urlFile(url),
      await findModule(srcPath),
    ]),
  )).reduce<{ [key: string]: string }>(toObject, {})

export type RollupConfig = InputOptions & { output: OutputOptions }

interface Options {
  babelPresets: ({ isModule }: { isModule: boolean }) => any
  babelPlugins: ({ isModule }: { isModule: boolean }) => any
  routes: { [key: string]: string }
}

export const extensions = ['.mjs', '.js', '.json', '.ts', '.tsx', '.css']

export const createRollupConfig = async (
  { babelPresets, babelPlugins, routes }: Options,
  env: string,
): Promise<RollupConfig[]> => {
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
    // Prerender (node-only) build
    {
      input: await createInputs(routes),
      experimentalCodeSplitting: true,
      output: {
        dir: 'prerender',
        format: 'cjs',
      },
      plugins: [
        postcss({ development, extract: true, write: false }),
        babel({ babelPresets, babelPlugins, isModule: true }),
        node({ extensions }),
        prerender({ routes }),
      ],
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
