/** @typedef {() => void} Dispatch */

/**
 * @template T
 * @typedef {() => T} Getter
 */

/**
 * @template T
 * @typedef {(nextVal: T) => T} Updater
 */

/**
 * @template T
 * @typedef {(nextVal: T | Updater<T>) => void} Setter
 */

const pending = new Set()
let flushing = false
function flush() {
  if (flushing) return
  flushing = true

  for (const cb of pending) {
    cb.run()
  }
  pending.clear()

  flushing = false
}

/**
 * @param {{ run: Dispatch, deps: Set<Set<any>> }} cb
 * @param {Set<any>} subs
 */
function sub(cb, subs) {
  subs.add(cb)
  cb.deps.add(subs)
}

/**
 * @template T
 * @arg {T} val
 * @returns {[Getter<T>, Setter<T>]}
 */
function signal(val) {
  /** @type {Set<{ run: Dispatch, deps: Set<Set<any>> }>} */
  const subs = new Set()

  /** @type {Getter<T>} */
  const get = () => {
    const cb = ctx[ctx.length - 1]
    if (cb) sub(cb, subs)
    return val
  }

  /** @type {Setter<T>} */
  const set = (nextVal) => {
    val = typeof nextVal === 'function'
      ? /** @type {Updater<T>} */ (nextVal)(val)
      : nextVal

    for (const sub of subs) {
      pending.add(sub)
    }

    Promise.resolve().then(flush)
  }
  return [get, set]
}

/**
 * @param {{ run: Dispatch, deps: Set<Set<any>> }} cb
 */
function cleanup(cb) {
  for (const dep of cb.deps) {
    dep.delete(cb)
  }
  cb.deps.clear()
}

/**
 * @param {Dispatch} fn
 */
function effect(fn) {
  const run = () => {
    cleanup(cb)
    ctx.push(cb)
    try {
      fn()
    } finally {
      ctx.pop()
    }
  }

  const cb = {
    run,
    deps: new Set(),
  }

  run()
}

/**
 * @template T
 * @param {() => T} fn
 * @returns {Getter<T>}
 */
function derived(fn) {
  const [s, set] = signal(/** @type {T} */ (undefined))
  effect(() => set(fn()))
  return s
}

// context stack for tracking dependencies
/** @type {{ run: Dispatch, deps: Set<Set<any>> }[]} */
const ctx = []

export { derived, effect, signal }
