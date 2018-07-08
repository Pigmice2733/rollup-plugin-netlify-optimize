import { Plugin } from 'rollup'
import { writeFile } from 'fs'
import { promisify } from 'util'
import { join, dirname } from 'path'
import { minify, Options as MinifyOptions } from 'html-minifier'
import makeDir from 'make-dir'

const write = promisify(writeFile)

interface Options {
  filename: string
  scripts?: {
    module?: string[]
    nomodule?: string[]
  }
  stylesheets?: string[]
}

const minifyOptions: MinifyOptions = {
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
}

const fixUrl = (path: string) => path.replace(/^\/?dist\//, '/')

const printScript = ({ module }: { module: boolean }) => (script: string) =>
  `<script async ${module ? 'type="module"' : 'nomodule'} src="${fixUrl(
    script,
  )}"></script>`

const printStylesheet = (stylesheet: string) =>
  `<link rel="stylesheet" href="${fixUrl(stylesheet)}"></link>`

export const html = ({
  filename,
  scripts = {},
  stylesheets = [],
}: Options): Plugin => ({
  name: 'html',
  buildStart: async () => {
    const contents = `<!doctype html>
    <html>
      <head>
        ${(scripts.module || []).map(printScript({ module: true }))}
        ${(scripts.nomodule || []).map(printScript({ module: false }))}
        ${stylesheets.map(printStylesheet)}
      </head>
      <body></body>
    </html>`
    const outFile = join(process.cwd(), filename)
    await makeDir(dirname(outFile))
    await write(outFile, minify(contents, minifyOptions))
  },
})
