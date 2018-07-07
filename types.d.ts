declare module 'rollup-plugin-node-resolve' {
  import { Plugin } from 'rollup'
  interface Options {
    module?: true
    jsnext?: true
    main?: true
    browser?: true
    extensions?: string[]
    preferBuiltins?: boolean
    jail?: string
    only?: (string | RegExp)[]
    modulesOnly?: boolean
    customResolveOptions?: any
  }
  export default function resolve(opts: Options): Plugin
}

declare module 'rollup-plugin-babel' {
  import { Plugin } from 'rollup'
  interface RollupBabelOptions {
    externalHelpers?: boolean
    include?: string | string[]
    exclude?: string | string[]
    externalHelpersWhitelist?: string[]
  }
  export type BabelPlugin = [string, any] | string
  export type BabelPreset = [string, any] | string
  export interface BabelOptions {
    ast?: boolean
    auxiliaryCommentAfter?: string
    auxiliaryCommentBefore?: string
    root?: string
    configFile?: false
    babelrc?: boolean
    babelrcRoots?: true | string | string[]
    envName?: string
    code?: boolean
    comments?: boolean
    compact?: 'auto' | boolean
    env?: {
      [key: string]: BabelOptions
    }
    extends?: string
    filename?: string
    filenameRelative?: string
    generatorOpts?: any
    getModuleId?: (moduleName: string) => string
    highlightCode?: boolean
    ignore?: string | RegExp | (string | RegExp)[]
    inputSourceMap?: any
    minified?: boolean
    moduleId?: string
    moduleIds?: boolean
    moduleRoot?: string
    only?: string | RegExp | (string | RegExp)[]
    parserOpts?: any
    plugins?: BabelPlugin[]
    presets?: BabelPreset[]
    retainLines?: boolean
    shouldPrintComment?: (comment: string) => boolean
    sourceFileName?: string
    sourceMaps?: false | 'inline' | 'both'
    sourceRoot?: string
    sourceType?: 'script' | 'module' | 'unambiguous'
    wrapPluginVisitorMethod?: any
  }
  export default function babel(
    options: RollupBabelOptions & BabelOptions,
  ): Plugin
}

declare module 'postcss-modules' {
  export interface PostcssModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: { [key: string]: string },
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    Loader?: any
    root?: string
  }
}

declare module 'rollup-plugin-postcss' {
  import { PostcssModulesOptions } from 'postcss-modules'
  import { Plugin } from 'rollup'
  interface PostcssOptions {
    extract?: false | string
    minimize: boolean
    modules: PostcssModulesOptions
  }
  export default function postcss(opts: PostcssOptions): Plugin
}

declare module 'rollup-plugin-terser' {
  import { Plugin } from 'rollup'
  import { MinifyOptions } from 'terser'
  export function terser(opts: MinifyOptions): Plugin
}
