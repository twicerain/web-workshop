/**
 * templates used for html pages
 *
 * components used in the layout come from shared so in CSR the browser can generate the components
 * client side using data returned from the API
 */
import {
  breadcrumbs,
  errorContent,
  html,
  icons,
  pageTitle,
  slideNav,
} from 'html'
import { getSlugs, loadContent } from './content.ts'
import { HTTPStatus, Slide } from 'types'

const head = html`
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preload" href="/styles/main.css" as="style" />
  <link rel="stylesheet" href="/styles/main.css" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">
  <script type="importmap">
  {
  "imports": {
    "unified": "https://esm.sh/unified@latest",
    "remark-parse": "https://esm.sh/remark-parse@latest",
    "remark-definition-list": "https://esm.sh/remark-definition-list@latest",
    "remark-gfm": "https://esm.sh/remark-gfm@latest",
    "remark-rehype": "https://esm.sh/remark-rehype@latest",
    "rehype-stringify": "https://esm.sh/rehype-stringify@latest",
    "unist-util-visit": "https://esm.sh/unist-util-visit@latest",
    "mermaid": "https://esm.sh/mermaid@latest",
    "shiki": "https://esm.sh/shiki@latest",
    "shiki/rehype": "https://esm.sh/@shikijs/rehype@latest",

    "md": "/shared/md.js",
    "html": "/shared/html.js",
    "icons": "/shared/icons.js",
    "types": "/shared/types.js",

    "signal": "/scripts/signal.js",
    "lib": "/scripts/lib/index.js"
    }
  }
  </script>
`

interface RenderContentProps {
  slug: string
  title?: string
  body?: string
  slides?: Slide[]
  index?: number
  footer?: string
  scripts?: string[]
  dataAttrs?: Record<string, string>
  mode?: 'ssr' | 'csr'
}

export async function renderContent(
  options: RenderContentProps,
): Promise<string> {
  const {
    slug,
    title = '',
    body = '',
    slides,
    index = 0,
    footer = '',
    scripts = [],
    dataAttrs = {},
    mode = 'ssr',
  } = options

  const isSlides = !!slides

  const dataAttrString = Object.entries(dataAttrs)
    .map(([k, v]) =>
      html`
        data-${k}="${v}"
      `
    )
    .join(' ')

  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        ${head}
        <title>${pageTitle(title)}</title>
      </head>
      <body ${dataAttrString}>
        <header>
          <button id="mode-toggle" data-mode="${mode}">${mode}</button>
          ${breadcrumbs({ slug, title, index, isSlides, slides })}
          <button id="laser-toggle"></button>
        </header>

        <aside id="left">
          ${await pageNav(getSlugs(), slug)}
        </aside>

        <main>
          <div id="content" ${dataAttrString}>
            ${body}
          </div>
        </main>

        <aside id="right">
          ${isSlides ? slideNav(slug, slides, index) : ''}
        </aside>

        <footer>
          ${footer}
        </footer>
        ${[
          '/scripts/lib/index.js',
          '/scripts/components/index.js',
          '/scripts/repl.js',
          ...scripts,
        ].map((src) => `<script type="module" src="${src}"></script>`)
          .join('\n')}

        <span id="spinner">
          ${icons.spinner}
        </span>
      </body>
    </html>
  `
}

// page nav is handled server side for both csr and ssr
// as I wanted to ensure they are always avaliable
export async function pageNav(
  pageSlugs: string[],
  currentPage?: string,
): Promise<string> {
  const pages: { slug: string; title: string }[] = await Promise.all(
    pageSlugs.map(async (slug) => {
      try {
        return await loadContent(slug)
      } catch (error) {
        console.error(`html.js error:`, error)
        return null
      }
    }),
  ).then((content) => content.filter((c) => c !== null))

  return html`
    <nav class="page-nav">
      <ul>
        ${pages
          .map(({ slug, title }) =>
            html`
              <li><a href="/${slug === 'index'
                ? ''
                : slug}" ${slug === currentPage
                ? ' aria-current="page"'
                : ''}>${title === 'index' ? '/' : title}</a></li>
            `
          )
          .join('')}
      </ul>
    </nav>
  `
}

export async function errorPage(
  error: HTTPStatus,
): Promise<string> {
  const { status, statusText } = error

  return await renderContent({
    slug: 'error',
    title: `${status} ${statusText}`,
    body: errorContent(error),
  })
}
