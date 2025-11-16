/**
 * hooks and exposes the vanilla signal lib to the devtools console
 */
import { derived, effect, signal } from 'signal'

const signals = { signals: 0, derived: 0, effects: 0 }

/** @typedef {typeof signal} Signal */
/** @typedef {typeof derived} Derived */
/** @typedef {typeof effect} Effect */

const signalFg = '#8ff'
const derivedFg = '#f8f'
const effectFg = '#ff8'

const createdFg = '#8f8'
const updatedFg = '#88f'
const runningFg = '#f88'
const resFg = '#fff'

/**
 * @param {'created' | 'updated' | 'running'} status
 * @param {'signal' | 'derived' | 'effect'} type
 * @param {number} idx
 */
function log(status, type, idx, result = '') {
  const statusFg = {
    created: createdFg,
    updated: updatedFg,
    running: runningFg,
  }[status]

  const typeFg = {
    signal: signalFg,
    derived: derivedFg,
    effect: effectFg,
  }[type]

  const statusStyle =
    `color: ${statusFg}; background: ${statusFg}2; font-weight: bold`
  const typeStyle =
    `color: ${typeFg}; background: ${typeFg}2; font-weight: bold`
  const resStyle = `color: ${resFg}; background: ${resFg}2; font-weight: bold`

  if (result) {
    console.log(
      `%c ${status} %c %c ${type} (${idx}) %c %c ${result} `,
      statusStyle,
      '',
      typeStyle,
      '',
      resStyle,
    )
  } else {
    console.log(
      `%c ${status} %c %c ${type} (${idx}) `,
      statusStyle,
      '',
      typeStyle,
    )
  }
}

/** @type {Signal} */
globalThis.signal = function (initialValue) {
  const [getter, setter] = signal(initialValue)
  const idx = ++signals.signals

  log('created', 'signal', idx, `= ${JSON.stringify(initialValue)}`)

  // @ts-ignore: ts cant infer this type but we know its fine
  const hooked = (value) => {
    const oldValue = getter()
    setter(value)
    const newValue = getter()
    log(
      'updated',
      'signal',
      idx,
      `${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`,
    )
  }

  return [getter, hooked]
}

/** @type {Derived} */
globalThis.derived = function (fn) {
  const idx = ++signals.derived

  /** @type {null | ReturnType<fn>} */
  let prev = null
  const hookedFn = () => {
    const result = fn()
    log(
      prev === null ? 'created' : 'updated',
      'derived',
      idx,
      `${prev === null ? '=' : `${prev} →`} ${JSON.stringify(result)}`,
    )
    prev = result
    return result
  }

  const hooked = derived(hookedFn)

  return hooked
}

/** @type {Effect} */
globalThis.effect = function (fn) {
  const idx = ++signals.effects

  log('created', 'effect', idx)

  const hooked = () => {
    log('running', 'effect', idx)
    fn()
  }

  return effect(hooked)
}
