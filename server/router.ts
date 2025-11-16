/**
 * routers, little confusing logical flow but Deno/Web standards
 * do provide a lot for you out of the box for implementing your own router
 */

import { serveDir } from '@std/http'
import { httpStatus, isHTTPStatus, STATUS_CODE, StatusCode } from 'types'
import { handleAPI, handleContent } from './handlers.ts'
import { errorPage } from './render.ts'
import { isContentSlug } from './content.ts'
import { ENV } from './config.ts'

type OrPromise<T> = T | Promise<T>

type Router = (routeArgs: {
  req: Request
  match: URLPatternResult
}) => OrPromise<string | undefined>

function getMode(req: Request): 'ssr' | 'csr' {
  const url = new URL(req.url)
  const urlMode = url.searchParams.get('mode')
  if (urlMode === 'csr' || urlMode === 'ssr') return urlMode

  const cookies = req.headers.get('cookie')
  if (cookies) {
    const cookieMode = cookies
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('render-mode='))
      ?.split('=')[1]
    if (cookieMode === 'csr' || cookieMode === 'ssr') return cookieMode
  }

  return 'ssr'
}

const routes: [URLPattern, Router][] = [
  // folder in project route, shared js utils/render functions
  [
    new URLPattern({ pathname: '/shared/:file' }),
    async ({ match }) => {
      const file = match.pathname.groups.file!
      try {
        return await Deno.readTextFile(`./shared/${file}`)
      } catch (error) {
        console.error(error)
        throw httpStatus(STATUS_CODE.NotFound)
      }
    },
  ],
  // content routers
  // home page handled separately to manually pass index route
  [
    new URLPattern({ pathname: '/' }),
    async ({ req }) => {
      return await handleContent(req, getMode(req), 'index')
    },
  ],
  // content routes for document responses
  [
    new URLPattern({ pathname: '/:page/:slide?' }),
    async ({ req, match }) => {
      const page = match.pathname.groups.page!
      const slide = match.pathname.groups.slide

      if (!isContentSlug(page)) {
        return // fall through for static server its not our business
      }

      return await handleContent(req, getMode(req), page, slide)
    },
  ],
  // content routes for JSON responses
  [
    new URLPattern({ pathname: '/api/:page/:slide?' }),
    async ({ match }) => {
      const page = match.pathname.groups.page!
      const slide = match.pathname.groups.slide

      if (!isContentSlug(page)) {
        // error since we only serve content via `/api` so it is our business
        throw httpStatus(STATUS_CODE.NotFound)
      }

      return await handleAPI(page, slide)
    },
  ],
]

// main router
export const router: Deno.ServeHandler = async (req) => {
  const url = new URL(req.url)
  // get the current render mode from the cookie
  try {
    // try all route handlers and return if match
    for (const [pattern, handler] of routes) {
      const match = pattern.exec(req.url)
      if (!match) continue

      const result = await handler({ req, match })

      if (!result) {
        continue
      }

      // shared is serving js
      const contentType = url.pathname.startsWith('/shared')
        ? 'text/javascript; charset=utf-8'
        // return json for API requests or documents otherwise
        : url.pathname.startsWith('/api')
        ? 'application/json'
        : 'text/html'

      return new Response(result, {
        status: STATUS_CODE.OK,
        headers: { 'content-type': contentType },
      })
    }

    // if we fall through its a static route
    const res = await serveDir(req, {
      fsRoot: 'public',
      urlRoot: '',
      headers: ENV.prod ? [] : [
        'Cache-Control: no-cache, no-store, must-revalidate',
        'Pragma: no-cache',
        'Expires: 0',
      ],
    })
    if (res.status >= 300) throw httpStatus(res.status as StatusCode)
    return res
  } catch (error) {
    console.error(error)
    const status = isHTTPStatus(error) ? error : httpStatus(
      STATUS_CODE.InternalServerError,
    )
    // return json error for api requests only
    if (url.pathname.startsWith('/api')) {
      return new Response(
        JSON.stringify(
          error instanceof Error
            ? { name: error.name, message: error.message }
            : error,
        ),
        {
          ...status,
          headers: { 'content-type': 'application/json' },
        },
      )
    }
    // error page for regular requests
    return new Response(
      await errorPage(status),
      {
        ...status,
        headers: { 'content-type': 'text/html' },
      },
    )
  }
}
