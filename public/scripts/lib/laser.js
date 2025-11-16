import { effect, signal } from 'signal'
import { icons } from 'html'

export const [laserActive, setLaserActive] = signal(
  localStorage.getItem('laser-pointer') === 'true',
)

effect(() => {
  document.documentElement.setAttribute(
    'data-laser',
    laserActive() ? 'true' : 'false',
  )
  localStorage.setItem('laser-pointer', laserActive() ? 'true' : 'false')
})

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('laser-toggle')
  if (!button) return

  button.innerHTML = icons.laser
  button.setAttribute('aria-label', 'Toggle laser pointer')
  button.setAttribute('title', 'toggle laser pointer [L]')
  button.setAttribute('data-laser', laserActive() ? 'true' : 'false')

  effect(() => {
    button.setAttribute('data-laser', laserActive() ? 'true' : 'false')
  })

  button.addEventListener('click', () => {
    setLaserActive((prev) => !prev)
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'l' || e.key === 'L') {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      e.preventDefault()
      setLaserActive((prev) => !prev)
    }
  })
})
