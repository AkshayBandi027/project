import { Lucia } from "lucia"
import { adapter } from "./db-adapter"

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (att) => {
    return {
      id: att.id,
      username: att.username,
    }
  },
})

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: { username: string; id: string }
  }
}
