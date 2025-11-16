import { effect, signal } from 'signal'

/** @returns {string} */
function getInitialMode() {
  return (
    new URLSearchParams(location.search).get('mode') ||
    localStorage.getItem('render-mode') ||
    'ssr'
  )
}

export const [mode, setMode] = signal(getInitialMode())

effect(() => {
  const currentMode = mode()
  localStorage.setItem('render-mode', currentMode)
  document.cookie =
    `render-mode=${currentMode}; path=/; max-age=31536000; SameSite=Lax`
})

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('mode-toggle')
  if (!button) return

  button.setAttribute('aria-label', 'toggle rendering mode')
  button.setAttribute('type', 'button')
  button.setAttribute('data-mode', mode())

  effect(() => {
    const currentMode = mode()
    button.setAttribute('data-mode', currentMode)
    button.innerHTML = currentMode
  })

  button.addEventListener('click', () => {
    const currentMode = button.getAttribute('data-mode')
    const newMode = currentMode === 'ssr' ? 'csr' : 'ssr'

    setMode(newMode)
    const url = new URL(globalThis.location.href)
    url.searchParams.set('mode', newMode)

    location.href = url.toString()
  })
})
