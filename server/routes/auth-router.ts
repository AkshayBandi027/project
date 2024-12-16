import { Hono } from "hono"
import type { Context } from "../context"
import { generateId } from "lucia"
import { db } from "../db-adapter"
import { userTable } from "../db/schema"
import { lucia } from "../lucia"
import { zValidator } from "@hono/zod-validator"
import { loginSchema, signUpSchema } from "../../shared/types"
import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"

export const authRouter = new Hono<Context>()
  .post("/signup", zValidator("form", signUpSchema), async (c) => {
    const { username, password, email } = c.req.valid("form")
    const userId = generateId(12)
    const hashedPassword = await Bun.password.hash(password)

    try {
      await db.insert(userTable).values({
        id: userId,
        username,
        hashedPassword,
        email,
      })

      const session = await lucia.createSession(userId, { username })
      const sessionCookie = lucia.createSessionCookie(session.id).serialize()
      c.header("Set-Cookie", sessionCookie, {
        append: true,
      })
    } catch (error) {
      console.log(error)
      throw new HTTPException(500, {message: "Internal Server Error"})
    }
  })
  .post("/login", zValidator("form", loginSchema), async (c) => {
    const { email, password } = c.req.valid("form")

    try {
      const user = await db.query.user.findFirst({
        where: eq(userTable.email, email),
      })
      if (!user) {
        throw new HTTPException( 401, {message: "Invalid email"})
      }
      const isPasswordCorrect = await Bun.password.verify(
        password,
        user.hashedPassword
      )
      if (!isPasswordCorrect) {
        throw new HTTPException( 401,{message: "Invalid password" })
      }
      const session = await lucia.createSession(user.id, {
        username: user.username,
      })
      const sessionCookie = lucia.createSessionCookie(session.id).serialize()
      c.header("Set-Cookie", sessionCookie, {
        append: true,
      })
    } catch (error) {
      console.log(error)
      throw new HTTPException(500, {message: "Internal Server Error"})  
    }
  })
  .get("logout", async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.redirect("/")
    }
    await lucia.invalidateSession(session.id)
    const sessionCookie = lucia.createBlankSessionCookie().serialize()
    c.header("Set-Cookie", sessionCookie)
  })
