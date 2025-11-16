/**
 * shared MD template utilities that work in both server and browser contexts
 *
 * all markdown to html conversion occurs here excluding mermaid diagram rendering
 * as mermaidjs does not work on the server without playwright or puppeteer etc
 */

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import {
  defListHastHandlers,
  remarkDefinitionList,
} from 'remark-definition-list'
import rehypeCopyCode from './rehype-copy-code.js'
import rehypeShiki from 'shiki/rehype'
import { createCssVariablesTheme } from 'shiki'

const shikiTheme = createCssVariablesTheme()

/**
 * @param {string} md
 * @returns {Promise<string>}
 */
export async function mdToHtml(md) {
  try {
    return String(
      await unified()
        .use(remarkParse)
        .use(remarkDefinitionList)
        .use(remarkGfm)
        .use(remarkRehype, {
          allowDangerousHtml: true,
          handlers: {
            ...defListHastHandlers,
          },
        })
        .use(rehypeShiki, {
          theme: shikiTheme,
          langs: [
            'javascript',
            'typescript',
            'jsx',
            'tsx',
            'html',
            'css',
            'svelte',
            'astro',
          ],
          transformers: [{
            preprocess(_code, options) {
              if (options.lang === 'mermaid') {
                return undefined
              }
            },
          }],
        })
        .use(rehypeCopyCode)
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(md),
    )
  } catch (error) {
    console.error(`md.js error:`, error)
    throw error
  }
}
