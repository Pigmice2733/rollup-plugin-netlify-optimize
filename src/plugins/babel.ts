import babelPlugin, { BabelPlugin, BabelPreset } from 'rollup-plugin-babel'
import { Plugin } from 'rollup'

export const babel = ({
  isModule,
  babelPlugins,
  babelPresets,
}: {
  isModule: boolean
  babelPlugins: ({ isModule }: { isModule: boolean }) => BabelPlugin[]
  babelPresets: ({ isModule }: { isModule: boolean }) => BabelPreset[]
}): Plugin =>
  babelPlugin({
    babelrc: false,
    plugins: babelPlugins({ isModule }),
    presets: babelPresets({ isModule }),
  })
