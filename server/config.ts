import { load } from '@std/dotenv'

// exports .env vars to the Deno.env process
export const ENV = {
  ...(await load({ export: true })),
  prod: Deno.env.get('ENV') === 'production',
}
