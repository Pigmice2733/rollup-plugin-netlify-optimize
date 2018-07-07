import { terser as terserPlugin } from 'rollup-plugin-terser'
import { Plugin } from 'rollup'

export const terser = ({ isModule }: { isModule: boolean }): Plugin =>
  terserPlugin({
    module: isModule,
    compress: {
      passes: 2,
      unsafe_comps: true,
      unsafe_math: true,
    },
  })
