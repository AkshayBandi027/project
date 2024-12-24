import { Hono } from "hono"
import type { Context } from "../context"
import { zValidator } from "@hono/zod-validator"
import { expenseCategorySchema, expenseSchema } from "../../shared/types"
import { HTTPException } from "hono/http-exception"
import { db } from "../db-adapter"
import { expenseCatgoriesTable, expensesTable } from "../db/schema"
import { checkAuth } from "../middleware/checkAuth"
import { and, eq } from "drizzle-orm"
import { generateId } from "lucia"

export const expenseRouter = new Hono<Context>()
  .post("/", checkAuth, zValidator("json", expenseSchema), async (c) => {
    const { description, amount } = c.req.valid("json")
    const user = c.get("user")
    const id = generateId(12)

    try {
      await db
        .insert(expensesTable)
        .values({
          id,
          userId: user?.id,
          description,
          amount,
          transactionDate: "",
        })
        .returning({
          id: expensesTable.id,
          description: expensesTable.description,
          amount: expensesTable.amount,
        })
    } catch (error) {
      console.log(`error while creating expense ${error}`)
      throw new HTTPException(500, { message: "Internal Server Error" })
    }
  })
  .get("/:id", checkAuth, async (c) => {
    const id = c.req.param("id")
    const expense = await db.query.expenses.findFirst({
      where: eq(expensesTable.id, id),
    })

    if (!expense) {
      throw new HTTPException(404, { message: "Expense not found" })
    }
    return c.json(expense)
  })
  .delete("/:id", checkAuth, async (c) => {
    const user = c.get("user")
    const id = c.req.param("id")

    try {
      const result = await db.transaction(async (tx) => {
        const expense = await tx.query.expenses.findFirst({
          where: and(
            eq(expensesTable.id, id),
            eq(expensesTable.userId, user!.id)
          ),
        })
        if (!expense) {
          throw new HTTPException(404, { message: "Expense not found" })
        }
        await tx.delete(expensesTable).where(eq(expensesTable.id, id))
        return c.json({ message: "Expense deleted successfully" })
      })
    } catch (error) {
      console.log(`error while deleting expense ${error}`)
      throw new HTTPException(500, { message: "Internal Server Error" })
    }
  })
  .post(
    "/category",
    checkAuth,
    zValidator("json", expenseCategorySchema),
    async (c) => {
      const user = c.get("user")
      const { name, icon } = c.req.valid("json")
      const id = generateId(12)

      try {
        await db.insert(expenseCatgoriesTable).values({
          id,
          icon,
          name,
          userId: user?.id,
        })
      } catch (error) {
        console.log(`error while creating expense category ${error}`)
        throw new HTTPException(500, { message: "Internal Server Error" })
      }
    }
  )
