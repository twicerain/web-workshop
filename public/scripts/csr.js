import { effect, signal } from 'signal'
import { mdToHtml } from 'md'
import {
  breadcrumbs,
  errorContent,
  html,
  pageTitle,
  slideFooter,
  slideNav,
} from 'html'
import { httpStatus } from 'types'
import { runMermaid } from 'lib'

/** @typedef {import('types').Content} Content */
/** @typedef {import('types').StatusCode} StatusCode */

/** @type {[() => Content | null, (v: Content | null) => void]} */
const [content, setContent] = signal(/** @type {Content | null} */ (null))
const [pathname, setPathname] = signal(location.pathname)

async function fetchAndRender() {
  const contentDiv = document.getElementById('content')
  const currentPath = location.pathname
  // TODO: this is legacy, dont need to match like this anymore
  const pathMatch = currentPath.match(/^\/([^/]+)(?:\/(.+?))?(?:\?|$)/)
  const pageSlug = pathMatch?.[1] || 'index'
  const slideIndex = pathMatch?.[2] || null

  if (!pageSlug) return

  try {
    if (!contentDiv) throw new Error('no content-div')

    document.documentElement.setAttribute('data-loading', 'true')

    const apiPath = slideIndex
      ? `/api/${pageSlug}/${slideIndex}`
      : `/api/${pageSlug}`
    const response = await fetch(apiPath)

    if (!response.ok) {
      const status = httpStatus(/** @type {StatusCode} */ (response.status))
      contentDiv.innerHTML = errorContent(status)
      return
    }

    const data = await response.json()
    // sets content body
    setContent(data)
    const mdHtml = await mdToHtml(data.body)
    contentDiv.innerHTML = mdHtml
    await runMermaid()

    await new Promise((resolve) => setTimeout(resolve, 300))
  } catch (error) {
    console.error('csr.js error:', error)

    const el = document.getElementById('content')
    if (el) {
      el.innerHTML = html`
        <p style="color: var(--base08);">Error: ${error instanceof Error
          ? error.message
          : error}</p>
      `
    }
  } finally {
    document.documentElement.removeAttribute('data-loading')
  }
}

addEventListener('click', (e) => {
  // @ts-ignore makes no difference
  const link = e.target?.closest('a')
  if (!link) return

  const href = link.getAttribute('href')
  if (!href || href.startsWith('#') || href.startsWith('http')) return

  // in CSR mode navigation is handled client-side
  e.preventDefault()
  const url = new URL(href, location.origin)
  url.searchParams.set('mode', 'csr')
  history.pushState(null, '', url)
  setPathname(url.pathname)
})

// browser back/forward navigation
addEventListener('popstate', () => {
  setPathname(location.pathname)
})

// this is a very poor example of how selectors should be used but I'm running out of time
document.addEventListener('DOMContentLoaded', () => {
  effect(() => {
    // listen to pathname changes
    pathname()
    // refetch content
    fetchAndRender()
  })

  effect(() => {
    // when content changes render the page
    const data = content()
    if (!data) return

    document.title = pageTitle(data.title)

    const breadcrumbsContainer = document.querySelector('.breadcrumbs')
    if (!breadcrumbsContainer) return

    breadcrumbsContainer.outerHTML = breadcrumbs({
      slug: data.slug,
      title: data.title,
      index: data.index,
      isSlides: !!data.slides,
      slides: data.slides,
    })

    const navContainer = document.querySelector('aside#right')
    if (!navContainer) return

    if (data?.slides) {
      navContainer.innerHTML = slideNav(data.slug, data.slides, data.index)
    } else {
      navContainer.innerHTML = ''
    }

    const pageNavLinks = document.querySelectorAll('.page-nav a')
    pageNavLinks.forEach((link) => {
      const href = link.getAttribute('href')
      const slug = href === '/' ? 'index' : href?.replace(/^\//, '')

      if (slug === data.slug) {
        link.setAttribute('aria-current', 'page')
      } else {
        link.removeAttribute('aria-current')
      }
    })

    const footerContainer = document.querySelector('footer')
    if (!footerContainer) return

    if (data?.slides) {
      footerContainer.innerHTML = slideFooter(
        data.slug,
        data.index,
        data.slides.length,
      )
    } else {
      footerContainer.innerHTML = ''
    }
  })
})
