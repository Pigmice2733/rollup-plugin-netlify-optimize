declare module 'rollup-plugin-babel-minify' {
  export default function babelMinify(options: any): any
}

declare module 'rollup-plugin-babel' {
  export default function babel(options: any): any
}

declare module 'rollup-plugin-node-resolve' {
  export default function nodeResolve(options: any): any
}

declare module 'rollup-plugin-postcss' {
  export default function postcss(options: any): any
}

declare module 'rollup-plugin-terser' {
  export function terser(options: any): any
}

declare module 'rollup-plugin-serve' {
  export default function serve(options: any): any
}
