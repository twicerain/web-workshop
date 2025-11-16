/**
 * squint when looking through this file
 * I had this idea when I should've been asleep or at the very least
 * should have been working on the actual slide content
 *
 * implemented till it worked and was never read or intended to be read
 */

import { signal } from 'signal'

const THEME_BASE_URL =
  'https://raw.githubusercontent.com/tinted-theming/schemes/spec-0.11/base16'
const THEMES_URL =
  'https://api.github.com/repos/tinted-theming/schemes/contents/base16'

/** @returns {string} */
export function getSavedTheme() {
  const localTheme = localStorage.getItem('base16-theme')
  if (localTheme) return localTheme

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'base16-theme') {
      return value
    }
  }

  // fallback
  return 'kanagawa'
}

/**
 * @param {string} yaml
 * @returns {{palette: Record<string, string>, variant: string}}
 */
export function parseYaml(yaml) {
  /** @type {{palette: Record<string, string>, variant: string}} */
  const theme = { palette: {}, variant: 'light' }
  const lines = yaml.split('\n')

  for (const line of lines) {
    const match = line.trim().match(
      /^base[0-9A-Fa-f]{2}:\s*["']?#([0-9a-fA-F]{6})["']?/,
    )
    if (match) {
      const key = line.trim().split(':')[0]
      theme.palette[key] = match[1]
      continue
    } else {
      const variant = line.trim().match(/^\s*variant:\s*["']?([a-zA-Z]+)["']?/)
      if (variant) {
        theme.variant = variant[1]
      }
    }
  }

  return theme
}

/** @param {Record<string, string>} palette */
export function applyTheme(palette) {
  const root = document.documentElement

  for (let i = 0; i <= 15; i++) {
    const key = `base0${i.toString(16).toUpperCase()}`
    if (palette[key]) {
      root.style.setProperty(`--${key}`, `#${palette[key]}`)
    }
  }
}

/**
 * @param {string} themeName
 * @returns {Promise<void>}
 */
export async function loadTheme(themeName) {
  const url = `${THEME_BASE_URL}/${themeName}.yaml`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Theme not found: ${themeName}`)
  }

  const yaml = await response.text()
  const theme = parseYaml(yaml)
  document.documentElement.setAttribute('data-variant', theme.variant)
  applyTheme(theme.palette)

  localStorage.setItem('base16-theme', themeName)
  document.cookie =
    `base16-theme=${themeName}; path=/; max-age=31536000; SameSite=Lax`
}

/**
 * @returns {Promise<string[]>}
 */
export async function fetchThemeList() {
  const response = await fetch(THEMES_URL)
  if (!response.ok) throw new Error('Failed to fetch theme list')

  /** @type {Array<{name: string}>} */
  const files = await response.json()
  const themes = files
    .filter((file) => file.name.endsWith('.yaml'))
    .map((file) => file.name.replace('.yaml', ''))
    .sort()

  return themes
}

export const [selectedTheme, setSelectedTheme] = signal(getSavedTheme())

document.addEventListener('DOMContentLoaded', async () => {
  const savedTheme = getSavedTheme()
  const currentTheme = document.documentElement.getAttribute('data-theme')

  if (currentTheme !== savedTheme) {
    try {
      await loadTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } catch (error) {
      console.error('theme.js error:', error)
    }
  }
})
