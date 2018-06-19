import { Plugin, OutputFile, OutputChunk, OutputBundle } from 'rollup'
import { dirname, join } from 'path'
import { promisify } from 'util'
import { writeFile as _writeFile, exists as _exists, mkdir as _mkdir } from 'fs'
const writeFile = promisify(_writeFile)
const exists = promisify(_exists)
const mkdir = promisify(_mkdir)

type Chunk = OutputChunk & { filename: string }

const printScript = (script: Chunk) =>
  `<script type="module" async src="/${
    script.filename
  }" crossorigin="use-credentials"></script>`
const printStyle = (style: string) =>
  `<link rel="stylesheet" href="/${style}"></link>`

const htmlTemplate = ({
  entryScripts,
  entryStyles,
}: {
  entryScripts: Chunk[]
  entryStyles: string[]
}) =>
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
  <title>Document</title>
  ${entryStyles.map(printStyle).join('\n  ')}
</head>
<body>
  <script nomodule async src="/nomodule.js"></script>
  ${entryScripts.map(printScript).join('\n  ')}
</body>
</html>`

const formatUrl = (url: string) =>
  url
    .split('/')
    .map(s => (s.startsWith(':') ? ':placeholder' : s))
    .join('/')

const printLink = (type: 'style' | 'script') => (link: string) =>
  `  Link: </${link}>; rel=preload; as=${type}`

const headersTemplate = ({
  routes,
  entryStyles,
  entryScripts,
  bundle,
}: {
  routes: Routes
  entryStyles: string[]
  entryScripts: Chunk[]
  bundle: OutputBundle
}) =>
  Object.entries(routes)
    .map(([url, path]) => {
      const paths = ['tsx', 'ts'].map(ext =>
        join(process.cwd(), 'src', path, '/index.' + ext),
      )
      return `${formatUrl(url)}
${entryStyles.map(printLink('style')).join('\n')}
${entryScripts
        .map(c => c.filename)
        .map(printLink('script'))
        .join('\n')}
${findCorrespondingOutputs(bundle, paths)
        .reduce<string[]>((a, s) => a.concat(s.filename, s.imports), [])
        .map(printLink('script'))
        .join('\n')}`
    })
    .join('\n\n')

const isChunk = (c: OutputFile): c is OutputChunk =>
  typeof c === 'object' && 'imports' in c

const findCorrespondingOutputs = (bundle: OutputBundle, inputFiles: string[]) =>
  Object.entries(bundle).reduce<Chunk[]>(
    (scripts, [filename, chunk]) =>
      isChunk(chunk) &&
      Object.keys(chunk.modules).some(sourceFile =>
        inputFiles.includes(sourceFile),
      )
        ? scripts.concat(Object.assign(chunk, { filename }))
        : scripts,
    [],
  )

export interface Routes {
  [key: string]: string
}

interface Options {
  outDir?: string
  routes: Routes
  entryStyles: string[]
}

export const htmlPlugin = (
  { outDir, entryStyles, routes }: Options = { entryStyles: [], routes: {} },
): Plugin => {
  let inputFiles: string[] = []
  return {
    name: 'html',
    options(inputOpts) {
      if (Array.isArray(inputOpts.input)) {
        inputFiles.push(...inputOpts.input.map(f => join(process.cwd(), f)))
      }
    },
    async generateBundle(outOpts, bundle) {
      const entryScripts = findCorrespondingOutputs(bundle, inputFiles)
      const outputDir =
        outDir || outOpts.dir || (outOpts.file ? dirname(outOpts.file) : null)
      if (!outputDir) {
        return this.error({
          message: `Unable to find html destination directory.
Please specify \`output.dir\`, \`output.file\`, or \`outDir\`
in the options for the html plugin`,
        })
      }
      const htmlPath = join(outputDir, 'index.html')
      const headersPath = join(outputDir, '_headers')
      if (!(await exists(outputDir))) {
        await mkdir(outputDir)
      }
      await Promise.all([
        writeFile(htmlPath, htmlTemplate({ entryScripts, entryStyles })),
        writeFile(
          headersPath,
          headersTemplate({
            routes,
            entryStyles,
            entryScripts: entryScripts.concat(),
            bundle,
          }),
        ),
      ])
    },
  }
}

export default htmlPlugin
