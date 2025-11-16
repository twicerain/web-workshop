import { Counter } from './counter.js'
import { ExampleCounter } from './example-counter.js'
import { ThemeSwitcher } from './theme-switcher.js'

// registers custom web-components
customElements.define('signal-counter', Counter)
customElements.define('example-counter', ExampleCounter)
customElements.define('theme-switcher', ThemeSwitcher)
