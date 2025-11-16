---
slides: true
index: 2
---

# Demos

Some reactive demos using vanilla signals.

_Counter and theme demos are written using [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components), allowing me to include them on pages written in and generated from markdown._

## REPL

Experiment with this site's vanilla signals implementation using the devtools console (<kbd>Ctrl + Shift + I</kbd>):

```js
const [name, setName] = signal('')
const [count, setCount] = signal(0)
const square = derived(() => Math.pow(count(), 2))
effect(() =>
  console.log(`count is currently ${count()}, derived square as ${square()}`)
)
effect(() => console.log(`Hello, ${name()}`))
// setName('world')
// setCount((prev) => prev + 1)
```

_References used for the implementation can be found in [resources](/resources)._

## Counter

Classic reactive counter demo + derivation example.

<signal-counter></signal-counter>

## Theme switcher

Async effect demo, fetches and applies base16 themes from [tinted theming](https://github.com/tinted-theming).

<theme-switcher></theme-switcher>
