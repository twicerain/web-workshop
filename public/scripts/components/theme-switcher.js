import { derived, effect, signal } from 'signal'
import { html } from 'html'
import { fetchThemeList, loadTheme, selectedTheme, setSelectedTheme } from 'lib'

const [availableThemes, setAvailableThemes] = signal(
  /** @type {string[]} */ ([]),
)
const [loading, setLoading] = signal(false)
const [error, setError] = signal(/** @type {string | null} */ (null))

export class ThemeSwitcher extends HTMLElement {
  /** @type {import('signal').Getter<string>} */ searchQuery
  /** @type {import('signal').Setter<string>} */ setSearchQuery
  /** @type {import('signal').Getter<string[]>} */ filteredThemes
  /** @type {import('signal').Getter<boolean>} */ showDropdown
  /** @type {import('signal').Setter<boolean>} */ setShowDropdown

  constructor() {
    super()
    ;[this.searchQuery, this.setSearchQuery] = signal('')
    ;[this.showDropdown, this.setShowDropdown] = signal(false)

    // derived themes based on search query
    this.filteredThemes = derived(() => {
      const query = this.searchQuery().toLowerCase()
      if (!query) return availableThemes()
      return availableThemes()
        .filter((theme) => theme.toLowerCase().includes(query))
        .slice(0, 10)
    })
  }

  async connectedCallback() {
    this.render()

    // fetch available themes on mount
    try {
      const themes = await fetchThemeList()
      setAvailableThemes(themes)
    } catch (error) {
      console.error('theme.js error:', error)
    }

    // load the saved theme on mount
    try {
      setLoading(true)
      setError(null)
      await loadTheme(selectedTheme())
    } catch (error) {
      setError(
        error instanceof Error ? error.message : JSON.stringify(error),
      )
      console.error('theme.js error', error)
    } finally {
      setLoading(false)
    }

    effect(() => {
      loading()
      error()
      this.updateStatus()
    })

    effect(() => {
      this.showDropdown()
      this.filteredThemes()
      this.updateDropdown()
    })

    effect(() => {
      selectedTheme()
      this.updatePlaceholder()
    })

    // close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      // @ts-ignore: makes no difference
      if (!this.contains(e?.target)) {
        this.setShowDropdown(false)
      }
    })
  }

  /**
   * @param {string} themeName
   */
  async selectTheme(themeName) {
    setSelectedTheme(themeName)
    this.setSearchQuery('')
    this.setShowDropdown(false)
    /** @type {HTMLInputElement | null} */
    const input = this.querySelector('#theme-input')
    if (input) {
      input.value = ''
    }

    try {
      setLoading(true)
      setError(null)
      await loadTheme(themeName)
    } catch (error) {
      setError(error instanceof Error ? error.message : JSON.stringify(error))
      console.error('theme.js error:', error)
    } finally {
      setLoading(false)
    }
  }

  render() {
    this.innerHTML = html`
      <div class="theme-switcher">
        <label for="theme-input">Theme:</label>
        <div class="autocomplete">
          <input
            type="text"
            id="theme-input"
            placeholder="${selectedTheme()}"
            autocomplete="off"
          />
          <div id="dropdown-container"></div>
        </div>
        <span id="status"></span>
      </div>
    `

    const input = this.querySelector('#theme-input')
    input?.addEventListener('input', (e) => {
      const value = /** @type {HTMLInputElement} */ (e.target).value
      this.setSearchQuery(value)
      this.setShowDropdown(true)
    })

    input?.addEventListener('focus', () => {
      this.setShowDropdown(true)
    })

    input?.addEventListener('keydown', (event) => {
      const e = /** @type {KeyboardEvent} */ (event)
      if (e.key === 'Enter') {
        e.preventDefault()
        const topResult = this.filteredThemes()[0]
        if (topResult) {
          this.selectTheme(topResult)
        }
      }
    })
  }

  updateDropdown() {
    const container = this.querySelector('#dropdown-container')
    if (!container) return

    if (this.showDropdown() && this.filteredThemes().length > 0) {
      container.innerHTML = html`
        <ul class="dropdown">
          ${this.filteredThemes()
            .map(
              (theme) =>
                html`
                  <li data-theme="${theme}">${theme}</li>
                `,
            )
            .join('')}
        </ul>
      `

      container.querySelectorAll('li').forEach((li) => {
        li.addEventListener('click', () => {
          const theme = li.getAttribute('data-theme')
          if (theme) {
            this.selectTheme(theme)
          }
        })
      })
    } else {
      container.innerHTML = ''
    }
  }

  updateStatus() {
    const status = this.querySelector('#status')
    if (!status) return

    if (loading()) {
      status.innerHTML = html`
        <span class="loading">Loading...</span>
      `
    } else if (error()) {
      status.innerHTML = html`
        <span class="error">${error()}</span>
      `
    } else {
      status.innerHTML = ''
    }
  }

  updatePlaceholder() {
    /** @type {HTMLInputElement | null} */
    const input = this.querySelector('#theme-input')
    if (input) {
      input.placeholder = selectedTheme()
    }
  }
}
