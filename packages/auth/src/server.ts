import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { db } from "@workspace/db"
import * as schema from "@workspace/db/schema"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [organization(), nextCookies()],
})

export type Session = typeof auth.$Infer.Session
