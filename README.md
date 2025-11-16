# Web Workshop

[![Deno](https://github.com/twicerain/web-workshop/actions/workflows/deno.yml/badge.svg)](https://github.com/twicerain/web-workshop/actions/workflows/deno.yml)

A vanilla site built to host slides for a "web frameworks" workshop I prepared and presented at work.

Demonstrates web fundamentals without abstraction by implementing both client-side and server-side rendering modes, vanilla reactive signals, and web components without dependencies.

## Features

- Toggleable CSR/SSR rendering
- Vanilla signals implementation
  - Including devtools console "REPL" for signals
- Markdown based content
- HTTP server and router with Deno
- Mermaid diagrams
- Web components
  - Theme switcher with persistent state
  - Toggleable laser pointer and more
- Isomorphic code shared between browser and server contexts
  - No build step thanks to JSDoc

## Usage

### Running locally

Install [Deno](https://docs.deno.com/runtime/getting_started/installation/).

Start the server:

```bash
# dev (disabled caching for demonstrative purposes)
deno task dev -- [PORT] # default port is 1111

# prod
deno task serve -- [PORT]
```

Visit [http://localhost:1111](http://localhost:1111) and use the toggle (top left) to switch between CSR and SSR modes.

### Testing

Some simple unit tests were included to demonstrate Deno's stdlib testing features:

```bash
deno task test
```

### Project structure

```
.
├── content/             # md content that is converted into routes
│   └── ...
│
├── server/              # http server and SSR renderer
│   ├── main.ts          # entry point
│   ├── content.ts       # content file loading and parsing
│   ├── handlers.ts      # request handlers for content/API routes
│   ├── render.ts        # Server-side HTML rendering
│   └── router.ts        # routing and static file serving
│
├── shared/              # isomorphic code (used by both server and client)
│   ├── html.js          # HTML template utilities and components
│   ├── md.js            # md processing pipeline
│   ├── types.js         # Shared type definitions and constants
│   └── ...
│
├── public/              # client-side assets
│   ├── scripts/
│   │   ├── csr.js       # client-side rendering
│   │   ├── signal.js    # vanilla signals implementation
│   │   ├── components/  # web components
│   │   └── lib/         # utils (theme, mermaid, code highlighting, etc.)
│   ├── styles/          # stylesheets
│   └── images/          # some static assets
│
└── deno.json            # deno configuration
```

## Acknowledgements

Inspired by the following articles on signals by Ryan Carniato, author of SolidJS:

- [A Hands-on Introduction to Fine-Grained Reactivity](https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf)
- [Building a Reactive Library from Scratch](https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p)

## License

[MIT](LICENSE)
