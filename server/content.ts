/**
 * handles the file io work for reading markdown files and md parsing
 */

import { extract } from '@std/front-matter/yaml'
import { Content, httpStatus, Slide, STATUS_CODE } from 'types'
import { ENV } from './config.ts'

// cache, wasn't used in practice for the workshop as I wanted to artificially
// exaggerate page load times for the demonstration, although I forgot to do that demo in the end
const slugs = new Array<string>()
const pages = new Map<string, Content>()

function getH1(body: string): string | undefined {
  return body.match(/^#\s+(.+)$/)?.[1]
}

function parseSlides(content: string, slug: string) {
  return content.trim().split('\n').reduce((slides, line) => {
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (!heading) {
      if (slides.length) {
        slides.at(-1)!.body += `\n${line}`
      }
      return slides
    }

    return [...slides, {
      title: heading[2].trim(),
      slug: slugify(slug),
      depth: heading[1].length, // heading level from # count
      body: line,
      index: slides.length,
    }]
  }, [] as Slide[])
}

export function slugify(str: string): string {
  if (!str) return ''
  return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, ' ').trim().replace(
    /[\s-]+/g,
    '-',
  )
}

const getIndex = (file: Deno.DirEntry) => {
  try {
    return extract<{ slides: boolean; index: number }>(
      Deno.readTextFileSync(`./content/${file.name}`),
    ).attrs.index
  } catch {
    return -1
  }
}
export function getSlugs(): string[] {
  // this is disgustingly inefficient, but I wrote this at a time when
  // the server was running too fast for there to be any discernable difference
  // between SSR and CSR modes so I don't care.
  // hopefully that file IO can be cached in a prod mode even with this dodgy router
  if (!(ENV.prod && slugs.length)) {
    slugs.splice(
      0,
      slugs.length,
      ...[...Deno.readDirSync('./content')]
        .filter((file) => file.isFile && file.name.endsWith('.md'))
        .sort((a, b) => getIndex(a) - getIndex(b))
        .map((file) => slugify(file.name.replace('.md', ''))),
    )
  }

  return slugs
}

export function isContentSlug(slug: string): boolean {
  if (!(ENV.prod && slugs.length)) {
    getSlugs()
  }
  return slugs.includes(slug)
}

export async function loadContent(
  pageSlug: string,
): Promise<Content> {
  try {
    if (ENV.prod && pages.has(pageSlug)) {
      return pages.get(pageSlug)!
    }

    const file = await Deno.readTextFile(`./content/${pageSlug}.md`)
    const { attrs, body } = (() => { // iefb
      try {
        return extract<{ slides: boolean }>(file)
      } catch {
        // doesn't have front-matter
        return { attrs: { slides: false }, body: file }
      }
    })()

    let page: Content = {
      slug: slugify(pageSlug), // redundant if requested via router but more bulletproof
      title: getH1(body) || slugify(pageSlug).replace('-', ' '),
      body,
      depth: 0,
      index: 0,
    }

    if (attrs.slides) {
      const slides = parseSlides(body, slugify(pageSlug))
      page = { ...page, body: slides[page.index].body, slides }
    }

    pages.set(pageSlug, page)

    return page
  } catch (error) {
    console.error(error)
    throw httpStatus(
      error instanceof Deno.errors.NotFound
        ? STATUS_CODE.NotFound
        : STATUS_CODE.InternalServerError,
    )
  }
}
