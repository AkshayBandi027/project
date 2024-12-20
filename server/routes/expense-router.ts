import { Hono } from "hono"
import type { Context } from "../context"
import { zValidator } from "@hono/zod-validator"
import { expenseSchema } from "../../shared/types"
import { HTTPException } from "hono/http-exception"
import { db } from "../db-adapter"
import { expensesTable } from "../db/schema"
import { checkAuth } from "../middleware/checkAuth"

export const expenseRouter = new Hono<Context>().post(
  "/",
  checkAuth,
  zValidator("json", expenseSchema),
  async (c) => {
    const { title, amount } = c.req.valid("json")
    const user = c.get("user")

    try {
      const expense = await db
        .insert(expensesTable)
        .values({
          userId: user?.id as string,
          title,
          amount,
        })
        .returning({
          id: expensesTable.id,
          title: expensesTable.title,
          amount: expensesTable.amount,
        })
    } catch (error) {
      console.log(`error while creating expense ${error}`)
      throw new HTTPException(500, { message: "Internal Server Error" })
    }
  }
)
