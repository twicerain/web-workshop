/**
 * defining shared types using jsdoc allows me to reuse them in client-side JS using jsdoc
 * or in the server written in typescript, without requiring a bundler/transpiler step
 *
 * if it works for svelte...
 */

/**
 * @typedef Content
 * @property {string} title
 * @property {string} body
 * @property {string} slug
 * @property {number} index
 * @property {number} depth,
 * @property {Slide[]=} slides
 */

/**
 * @typedef {Omit<Content, 'slides'>} Slide
 */

export const renderModes = /** @type {const} */ ({
  ssr: 'Server-Side',
  csr: 'Client-Side',
})

/** @typedef {keyof typeof renderModes} RenderMode */

export const STATUS_TEXT = /** @type {const} */ {
  200: 'OK',
  400: 'Bad Request',
  404: 'Not Found',
  500: 'Internal Server Error',
}

/** @type {Record<string, StatusCode>} */
export const STATUS_CODE = /** @type {const} */ {
  OK: 200,
  BadRequest: 400,
  NotFound: 404,
  InternalServerError: 500,
}

/** @typedef {keyof typeof STATUS_TEXT} StatusCode */
/** @typedef {typeof STATUS_TEXT[StatusCode]} StatusText */

/**
 * @typedef HTTPStatus
 * @property {StatusCode} status
 * @property {StatusText} statusText
 */

/**
 * @param {StatusCode} status
 * @returns {HTTPStatus}
 */
export function httpStatus(status) {
  return {
    status,
    statusText: STATUS_TEXT[status],
  }
}
/**
 * @param {unknown} status
 * @returns {status is HTTPStatus}
 */
export function isHTTPStatus(status) {
  return (
    typeof status === 'object' &&
    status !== null &&
    'status' in status &&
    'statusText' in status &&
    typeof /** @type {HTTPStatus} */ (status).status === 'number' &&
    typeof /** @type {HTTPStatus} */ (status).statusText === 'string'
  )
}
