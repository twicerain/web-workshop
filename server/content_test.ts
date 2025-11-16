import { assertEquals } from '@std/assert'
import { slugify } from './content.ts'

Deno.test('slugify', async (t) => {
  await t.step('converts to lowercase', () => {
    assertEquals(slugify('Hello World'), 'hello-world')
  })

  await t.step('removes special characters', () => {
    assertEquals(slugify('Hello@World!'), 'hello-world')
  })

  await t.step('handles multiple spaces and dashes', () => {
    assertEquals(slugify('Hello   ---   World'), 'hello-world')
  })

  await t.step('trims whitespace', () => {
    assertEquals(slugify('  hello world  '), 'hello-world')
  })

  await t.step('preserves alphanumeric characters', () => {
    assertEquals(slugify('Test123'), 'test123')
  })
})
