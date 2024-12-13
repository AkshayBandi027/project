import type { Env } from "hono";
import type {User,Session} from "lucia"

export interface Context {
   Variables: {
    user: User | null;
    session: Session | null;
   }
}