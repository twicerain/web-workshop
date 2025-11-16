/**
 * handlers for different content requests
 */

import { loadContent } from './content.ts'
import { renderContent } from './render.ts'
import { mdToHtml } from 'md'
import { slideFooter } from 'html'
import { Content, httpStatus, STATUS_CODE } from 'types'

async function getContent(
  slug: string,
  slide?: string,
): Promise<[Content, number?]> {
  const index = slide ? Number(slide) : undefined

  if (slide !== undefined && (isNaN(index!) || index! < 0)) {
    throw httpStatus(STATUS_CODE.BadRequest)
  }

  const page = await loadContent(slug)

  const content = index !== undefined ? page.slides?.[index] : page

  if (!content) {
    throw httpStatus(STATUS_CODE.NotFound)
  }

  // append slides so slideNav can be rendered for slide pages
  return [{ ...content, slides: page.slides }, index]
}

export async function handleSSR(
  content: Content,
  index?: number,
): Promise<string> {
  return await renderContent({
    ...content,
    body: await mdToHtml(content.body),
    index,
    footer: content.slides
      ? slideFooter(content.slug, index ?? 0, content.slides.length)
      : '',
    mode: 'ssr',
  })
}

export async function handleCSR(
  content: Content,
  index?: number,
): Promise<string> {
  return await renderContent({
    slug: content.slug,
    index,
    // csr.js handles rendering the body etc via the api
    scripts: ['/scripts/csr.js'],
    mode: 'csr',
  })
}

export async function handleContent(
  _req: Request,
  mode: 'ssr' | 'csr',
  page: string,
  slide?: string,
): Promise<string> {
  const [content, index] = await getContent(page, slide)

  // redundant but was originally planning to have SSG, ISR etc
  switch (mode) {
    case 'csr':
      return await handleCSR(content, index)
    default: // ssr
      return await handleSSR(content, index)
  }
}

export async function handleAPI(
  page: string,
  slide?: string,
): Promise<string> {
  const [content] = await getContent(page, slide)

  return JSON.stringify(content)
}
