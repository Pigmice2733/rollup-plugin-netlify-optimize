import nodeResolve from 'rollup-plugin-node-resolve'

export const node = ({ extensions }: { extensions: string[] }) =>
  nodeResolve({
    jsnext: true,
    extensions,
  })
