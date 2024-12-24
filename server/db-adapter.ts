import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { expenseCatgoriesTable, expensesTable, incomeCategoriesTable, incomeTable, sessionTable, userTable } from "./db/schema"
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"

const queryClient = postgres(process.env.DATABASE_URL!)
export const db = drizzle(queryClient, {
    schema: {
        user: userTable,
        session: sessionTable,
        expenses: expensesTable,
        expenseCategories: expenseCatgoriesTable,
        income: incomeTable,        
        incomeCategories: incomeCategoriesTable,
    }
})

export const adapter = new DrizzlePostgreSQLAdapter(db,sessionTable,userTable)
