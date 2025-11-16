export async function runMermaid() {
  const mermaidElements = document.querySelectorAll('code.language-mermaid')
  if (mermaidElements.length === 0) return

  try {
    const mermaid = (await import('mermaid')).default

    const computed = globalThis.getComputedStyle(document.documentElement)
    /** @param {string} name */
    const getVar = (name) => computed.getPropertyValue(name)
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        darkMode: document.documentElement.getAttribute('data-variant') ||
          'light',
        fontFamily: 'monospace',
        fontSize: 10,
        background: getVar('--bg-dark'),
        primaryColor: getVar('--secondary'),
        secondaryColor: getVar('--border'),
      },
    })
    await mermaid.run({
      querySelector: 'code.language-mermaid',
    })
  } catch (error) {
    console.error('mermaid.js error:', error)
  }
}

document.addEventListener('DOMContentLoaded', () => runMermaid())
