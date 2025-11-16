import { html } from 'html'

// simpler counter used in slides to demo what reactivity refers to and tries to solve
export class ExampleCounter extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    const idx = this.getAttribute('data-idx')
    this.innerHTML = html`
      <button id="count${idx}"></button>
      <span id="doubled${idx}"></span>
    `

    const countElement = document.getElementById(`count${idx}`)
    const doubledElement = document.getElementById(`doubled${idx}`)
    if (!countElement || !doubledElement) return

    let count = 0
    let doubled = count * 2

    countElement.textContent = count.toString()
    doubledElement.textContent = doubled.toString()

    if (this.getAttribute('data-broken') === 'true') {
      countElement.addEventListener('click', () => {
        doubled = ++count * 2

        console.log(`[example ${idx}] - count: ${count}, doubled: ${doubled}`)
      })
    } else {
      countElement.addEventListener('click', () => {
        doubled = ++count * 2

        countElement.textContent = count.toString()
        doubledElement.textContent = doubled.toString()

        console.log(`[example ${idx}] - count: ${count}, doubled: ${doubled}`)
      })
    }
  }
}
