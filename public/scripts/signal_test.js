import { assertEquals } from '@std/assert'
import { derived, effect, signal } from './signal.js'

Deno.test('signals', async (t) => {
  await t.step('sets', async () => {
    const [count, setCount] = signal(0)

    assertEquals(count(), 0)

    setCount(1)
    setCount(2)
    setCount(3)
    // Signal updates are async (Promise.resolve().then(flush))
    await new Promise((resolve) => setTimeout(resolve, 0))

    assertEquals(count(), 3)
  })

  await t.step('updates', async () => {
    const [count, setCount] = signal(0)

    /** @param {number} prev */
    const updater = (prev) => prev + 1

    setCount(updater)
    setCount(updater)
    setCount(updater)
    await new Promise((resolve) => setTimeout(resolve, 0))

    assertEquals(count(), 3)
  })
})

Deno.test('effect', async (t) => {
  await t.step('runs immediately', () => {
    const [count] = signal(3)
    let effectValue = 0

    effect(() => {
      effectValue = count()
    })

    assertEquals(effectValue, 3)
  })

  await t.step('runs on signal set', async () => {
    const [count, setCount] = signal(0)
    let effectRuns = 0

    effect(() => {
      count()
      effectRuns++
    })

    assertEquals(effectRuns, 1)

    setCount(1)
    await new Promise((resolve) => setTimeout(resolve, 0))

    assertEquals(effectRuns, 2)
  })

  await t.step('tracks multiple signals', async () => {
    const [a, setA] = signal(1)
    const [b, setB] = signal(2)
    let sum = 0

    effect(() => {
      sum = a() + b()
    })

    assertEquals(sum, 3)

    setA(3)
    await new Promise((resolve) => setTimeout(resolve, 0))
    assertEquals(sum, 5)

    setB(4)
    await new Promise((resolve) => setTimeout(resolve, 0))
    assertEquals(sum, 7)
  })

  await t.step('batches multiple updates', async () => {
    const [count, setCount] = signal(0)
    let effectRuns = 0

    effect(() => {
      count()
      effectRuns++
    })

    assertEquals(effectRuns, 1)

    setCount(1)
    setCount(2)
    setCount(3)

    await new Promise((resolve) => setTimeout(resolve, 0))

    assertEquals(effectRuns, 2)
  })
})

Deno.test('derived', async (t) => {
  await t.step('computes value', async () => {
    const [count, setCount] = signal(1)
    const doubled = derived(() => count() * 2)

    await new Promise((resolve) => setTimeout(resolve, 0))
    assertEquals(doubled(), 2)

    setCount(2)
    await new Promise((resolve) => setTimeout(resolve, 0))

    assertEquals(doubled(), 4)
  })

  await t.step('chains mutliple signals', async () => {
    const [a, setA] = signal(1)
    const [b, setB] = signal(2)
    const sum = derived(() => a() + b())
    const doubled = derived(() => sum() * 2)

    await new Promise((resolve) => setTimeout(resolve, 0))
    assertEquals(sum(), 3)
    assertEquals(doubled(), 6)

    setA(3)
    await new Promise((resolve) => setTimeout(resolve, 0))

    assertEquals(sum(), 5)
    assertEquals(doubled(), 10)

    setB(4)
    await new Promise((resolve) => setTimeout(resolve, 0))

    assertEquals(sum(), 7)
    assertEquals(doubled(), 14)
  })

  await t.step('only recomputes when dependencies change', async () => {
    const [a, setA] = signal(1)
    const [b] = signal(2)
    let computeCount = 0

    const sum = derived(() => {
      computeCount++
      return a() + b()
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    assertEquals(sum(), 3)
    assertEquals(computeCount, 1)

    assertEquals(sum(), 3)
    assertEquals(computeCount, 1)

    setA(3)
    await new Promise((resolve) => setTimeout(resolve, 0))

    assertEquals(sum(), 5)
    assertEquals(computeCount, 2)
  })
})
