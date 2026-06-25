import { neon } from "@neondatabase/serverless"
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http"

import * as schema from "./schema/index"

type Db = NeonHttpDatabase<typeof schema>

let instance: Db | undefined

export function getDb(): Db {
  if (instance) {
    return instance
  }

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }

  instance = drizzle(neon(url), { schema })
  return instance
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver)
  },
})
