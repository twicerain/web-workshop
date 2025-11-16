import { assertEquals, assertThrows } from '@std/assert'
import { parsePort } from './main.ts'

Deno.test('parsePort', async (t) => {
  await t.step('throws for invalid port numbers', () => {
    assertThrows(() => parsePort(['123']))
    assertThrows(() => parsePort(['1022']))
    assertThrows(() => parsePort(['0000']))
    assertThrows(() => parsePort(['10000']))
    assertThrows(() => parsePort(['99999']))
  })

  await t.step('parses valid port numbers', () => {
    assertEquals(parsePort(['1024']), 1024)
    assertEquals(parsePort(['1234']), 1234)
    assertEquals(parsePort(['9999']), 9999)
  })

  await t.step('has default port for no argument', () => {
    assertEquals(parsePort([]), 1111)
  })
})
