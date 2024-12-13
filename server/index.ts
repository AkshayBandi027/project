import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { lucia } from './lucia'
import type {Context} from "./context"
import { authRouter } from './routes/auth-router'

const app = new Hono<Context>()

app.use("*", cors(), async(c,next) => {
    const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "")
   
    if(!sessionId) {
        c.set("user", null)
        c.set("session",null),
        next()
        return 
    }

    const {session,user } = await lucia.validateSession(sessionId)
    if(session && session.fresh) {
        c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
         append: true
        })
    }
    if(!session) {
        c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
            append: true
        })
    }
    c.set("session",session),
    c.set("user",user)
    return next()
})

const routes = app.basePath("/api").route("/auth", authRouter)

export default app