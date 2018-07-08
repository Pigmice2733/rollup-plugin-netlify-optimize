import { Plugin } from 'rollup'
import { createInputs } from '../prerender-config'
import { join, dirname } from 'path'
import { render } from 'preact-render-to-string'
import { h } from 'preact'
import { writeFile } from 'fs'
import { promisify } from 'util'
import makeDir from 'make-dir'
import { urlFile } from '../url-file'
import { htmlTemplate } from './html'

const writeFileAsync = promisify(writeFile)

interface Routes {
  [key: string]: string
}

interface Options {
  routes: Routes
}

const processRoute = async (route: string) => {
  const inputFile = join(process.cwd(), 'prerender', route)
  const outputFile = join(process.cwd(), 'dist', route + '.html')
  const html = render(h(require(inputFile), null))
  const contents = htmlTemplate({
    scripts: {
      module: ['dist/index.js'],
      nomodule: ['dist/index.nomodule.js'],
    },
    stylesheets: ['dist/index.css'],
    body: html,
  })
  await makeDir(dirname(outputFile))
  await writeFileAsync(outputFile, contents)
  console.log(`rendered ${route}`)
}

const netlifyUrl = (url: string) =>
  url
    .split('/')
    .map(c => (c.startsWith(':') ? ':placeholder' : c))
    .join('/')

const createHtmlFiles = async (routes: Routes) => {
  const r = await createInputs(routes)
  return Promise.all(Object.keys(r).map(processRoute))
}

const createRedirects = async (routes: Routes) => {
  const contents = Object.keys(routes)
    .map(r => netlifyUrl(r) + '  /' + urlFile(netlifyUrl(r)) + '.html  200')
    .join('\n')
  const outputFile = join(process.cwd(), 'dist', '_redirects')
  await makeDir(dirname(outputFile))
  await writeFileAsync(outputFile, contents)
  console.log('created _redirects')
}

export const prerender = ({ routes }: Options): Plugin => {
  return {
    name: 'prerender',
    generateBundle: () => {
      createHtmlFiles(routes)
      createRedirects(routes)
    },
  }
}
