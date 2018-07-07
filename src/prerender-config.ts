import { postcss } from './plugins/postcss'
import { babel } from './plugins/babel'
import { node } from './plugins/node'
import { terser } from './plugins/terser'
import { RollupConfig, extensions } from './rollup-config'
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

const development = true

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

export const createPrerenderConfig = async ({
  babelPlugins,
  babelPresets,
  routes,
}: Options): Promise<RollupConfig> => {
  createInputs(routes).then(el => console.log(el))
  return {
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
      terser({ isModule: true }),
      prerender({ routes }),
    ],
  }
}
