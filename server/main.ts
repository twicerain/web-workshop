import { parseArgs } from '@std/cli'
import { assert } from '@std/assert'
import { router } from './router.ts'

export function parsePort(args: string[]) {
  const { _: parsed } = parseArgs(args)

  const parsedPort: undefined | string | number = parsed[0]
  if (parsedPort === undefined) return 1111
  const port = parsedPort!

  assert(
    typeof port === 'number' && port >= 1024 && port < 10_000,
    'optional port argument must be a valid port number between 1023 and 9999',
  )
  return port as number
}

// entry point
function main(port: number) {
  // starts the http server
  Deno.serve({ port: port }, async (req, info) => {
    // content/api/static etc all handled in the router
    const res = await router(req, info)

    // simple logger for each request
    console.info(
      `[${
        new Date().toLocaleString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      }] ${req.method}: ${req.url} - ${res.status} ${res.statusText}`,
    )

    return res
  })
}

// https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const port = parsePort(Deno.args)
  main(port)
}
