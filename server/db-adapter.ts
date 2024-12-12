import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { sessionTable, userTable } from "./db/schema"
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"

const queryClient = postgres(process.env.DATABASE_URL!)
export const db = drizzle(queryClient, {
    schema: {
        user: userTable,
        session: sessionTable,
    }
})

export const adapter = new DrizzlePostgreSQLAdapter(db,sessionTable,userTable)
