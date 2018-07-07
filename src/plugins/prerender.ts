import { Plugin } from 'rollup'
import { createInputs } from '../prerender-config'
import { join, dirname } from 'path'
import { render } from 'preact-render-to-string'
import { h } from 'preact'
import { writeFile } from 'fs'
import { promisify } from 'util'
import makeDir from 'make-dir'

const writeFileAsync = promisify(writeFile)

interface Routes {
  [key: string]: string
}

interface Options {
  routes: Routes
}

const processRoute = async (route: string) => {
  console.log(`rendering ${route}`)
  const inputFile = join(process.cwd(), 'prerender', route)
  const outputFile = join(process.cwd(), 'dist', route + '.html')
  const html = render(h(require(inputFile), null))
  await makeDir(dirname(outputFile))
  await writeFileAsync(outputFile, html)
  console.log(`rendered ${route}`)
}

export const prerender = ({ routes }: Options): Plugin => {
  return {
    name: 'prerender',
    generateBundle: () =>
      createInputs(routes).then(r => {
        Object.keys(r).map(processRoute)
      }),
  }
}
