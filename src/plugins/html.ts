import { Plugin } from 'rollup'
import { writeFile } from 'fs'
import { promisify } from 'util'
import { join, dirname } from 'path'
import { minify, Options as MinifyOptions } from 'html-minifier'
import makeDir from 'make-dir'

const write = promisify(writeFile)

interface TemplateOptions {
  scripts?: {
    module?: string[]
    nomodule?: string[]
  }
  stylesheets?: string[]
  body?: string
}

interface Options extends TemplateOptions {
  filename: string
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

export const htmlTemplate = ({
  scripts = {},
  stylesheets = [],
  body = '',
}: TemplateOptions) =>
  minify(
    `<!doctype html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            ${(scripts.module || []).map(printScript({ module: true }))}
            ${(scripts.nomodule || []).map(printScript({ module: false }))}
            ${stylesheets.map(printStylesheet)}
          </head>
          <body>${body}</body>
        </html>`,
    minifyOptions,
  )

export const html = ({
  filename,
  scripts,
  stylesheets,
  body,
}: Options): Plugin => ({
  name: 'html',
  buildStart: async () => {
    const contents = htmlTemplate({ scripts, stylesheets, body })
    const outFile = join(process.cwd(), filename)
    await makeDir(dirname(outFile))
    await write(outFile, contents)
  },
})
