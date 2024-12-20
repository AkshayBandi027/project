import { Hono } from "hono"
import { cors } from "hono/cors"
import { lucia } from "./lucia"
import type { Context } from "./context"
import { authRouter } from "./routes/auth-router"
import { HTTPException } from "hono/http-exception"
import { expenseRouter } from "./routes/expense-router"

const app = new Hono<Context>()

app.use("*", cors(), async (c, next) => {
  const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "")

  if (!sessionId) {
    c.set("user", null)
    c.set("session", null), next()
    return
  }

  const { session, user } = await lucia.validateSession(sessionId)
  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    })
  }
  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    })
  }
  c.set("session", session), c.set("user", user)
  return next()
})

const routes = app
  .basePath("/api")
  .route("/auth", authRouter)
  .route("/expense", expenseRouter)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  return c.text("Internal Server Error", 500)
})

export default {
  port: process.env.PORT ?? 3000,
  hostname: "0.0.0.0",
  fetch: app.fetch,
}
export type ApiRoutes = typeof routes
