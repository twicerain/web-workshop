addEventListener('click', async (e) => {
  // @ts-ignore makes no difference
  const button = e.target?.closest('.copy-code')
  if (!button) return

  const codeText = button.getAttribute('data-code')
  if (!codeText) return

  try {
    await navigator.clipboard.writeText(codeText)
    button.classList.add('copied')
    setTimeout(() => button.classList.remove('copied'), 2000)
  } catch (error) {
    console.error('code.js error:', error)
  }
})
