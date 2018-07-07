import postcssPlugin from 'rollup-plugin-postcss'
import { Plugin } from 'rollup'

export const postcss = ({
  development,
  extract,
  write = true,
}: {
  development: boolean
  extract: boolean
  write?: boolean
}): Plugin =>
  postcssPlugin({
    extract: extract ? (write ? 'dist/index.css' : 'dist/trash.css') : false,
    minimize: !development,
    modules: {
      generateScopedName: development
        ? '[local]-[hash:base64:4]'
        : '[hash:base64:4]',
    },
  })
