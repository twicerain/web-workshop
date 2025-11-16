import { derived, effect, signal } from 'signal'
import { html } from 'html'

// used in demos slides as an example of vanilla signals and computed/derived values
export class Counter extends HTMLElement {
  /** @type {import('signal').Getter<number> } */ count
  /** @type {import('signal').Setter<number> } */ setCount
  /** @type {import('signal').Getter<boolean>} */ prime
  /** @type {import('signal').Getter<boolean>} */ fib
  /** @type {boolean=} */ confirmed

  constructor() {
    super()
    ;[this.count, this.setCount] = signal(0)
    this.prime = derived(() => {
      const n = this.count()

      for (let i = 2, s = Math.sqrt(n); i <= s; i++) {
        if (n % i === 0) return false
      }
      return n > 1
    })
    this.fib = derived(() => {
      const n = this.count()
      if (n < 0) return false
      /**
       * @param {number} x
       * @returns {boolean}
       */
      const isPerfectSquare = (x) => {
        const s = Math.sqrt(x)
        return s === Math.floor(s)
      }
      const sqr = n * n
      return isPerfectSquare(5 * sqr + 4) || isPerfectSquare(5 * sqr - 4)
    })
  }

  connectedCallback() {
    effect(() => {
      this.count()
      this.update()
    })
  }

  update() {
    let type = this.fib() ? 'fib' : ''
    type += this.prime() ? 'prime' : ''

    this.innerHTML = html`
      <div class="counter">
        <button id="increment" class="btn ${type}">
          ${this.count() > 0 ? `click x${this.count()}` : `click me`}
        </button>
        <span>${type}</span>
      </div>
    `

    this.querySelector('#increment')?.addEventListener('click', () => {
      this.setCount((prev) => prev + 1)
    })
  }
}
