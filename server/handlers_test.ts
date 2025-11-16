import { assertEquals } from '@std/assert'
import { handleAPI, handleContent } from './handlers.ts'
import { isHTTPStatus, STATUS_CODE } from 'types'

Deno.test('handleAPI', async (t) => {
  await t.step('rejects invalid slide index', async () => {
    try {
      await handleAPI('index', 'invalid')
      throw new Error('Expected handleAPI to throw')
    } catch (error) {
      if (isHTTPStatus(error)) {
        assertEquals(error.status, STATUS_CODE.BadRequest)
      } else {
        throw error
      }
    }
  })

  await t.step('rejects negative slide index', async () => {
    try {
      await handleAPI('index', '-1')
      throw new Error('Expected handleAPI to throw')
    } catch (error) {
      if (isHTTPStatus(error)) {
        assertEquals(error.status, STATUS_CODE.BadRequest)
      } else {
        throw error
      }
    }
  })

  await t.step('accepts valid page', async () => {
    const result = await handleAPI('index')
    const json = JSON.parse(result)
    if (!json.slug || !json.body) {
      throw new Error('Expected content structure with slug and body')
    }
  })
})

Deno.test('handleContent', async (t) => {
  await t.step('rejects invalid slide index', async () => {
    const req = new Request('http://localhost/index/invalid')
    try {
      await handleContent(req, 'ssr', 'index', 'invalid')
      throw new Error('Expected handleContent to throw')
    } catch (error) {
      if (isHTTPStatus(error)) {
        assertEquals(error.status, STATUS_CODE.BadRequest)
      } else {
        throw error
      }
    }
  })

  await t.step('rejects negative slide index', async () => {
    const req = new Request('http://localhost/index/-1')
    try {
      await handleContent(req, 'ssr', 'index', '-1')
      throw new Error('Expected handleContent to throw')
    } catch (error) {
      if (isHTTPStatus(error)) {
        assertEquals(error.status, STATUS_CODE.BadRequest)
      } else {
        throw error
      }
    }
  })

  await t.step('accepts valid page in SSR mode', async () => {
    const req = new Request('http://localhost/index')
    const result = await handleContent(req, 'ssr', 'index')
    if (!result.includes('<!DOCTYPE html>')) {
      throw new Error('Expected HTML document')
    }
  })

  await t.step('accepts valid page in CSR mode', async () => {
    const req = new Request('http://localhost/index')
    const result = await handleContent(req, 'csr', 'index')
    if (!result.includes('<!DOCTYPE html>')) {
      throw new Error('Expected HTML document')
    }
  })
})
