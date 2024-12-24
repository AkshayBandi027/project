import { Hono } from "hono"
import type { Context } from "../context"
import { checkAuth } from "../middleware/checkAuth"
import { zValidator } from "@hono/zod-validator"
import { incomeCategorySchema, incomeSchema } from "../../shared/types"
import { HTTPException } from "hono/http-exception"
import { db } from "../db-adapter"
import { incomeCategoriesTable, incomeTable } from "../db/schema"
import { generateId } from "lucia"
import { eq, and } from "drizzle-orm"

export const incomeRouter = new Hono<Context>()
  .post("/", checkAuth, zValidator("json", incomeSchema), async (c) => {
    const { description, amount } = c.req.valid("json")
    const user = c.get("user")
    const incomeId = generateId(12)
    try {
      const income = await db
        .insert(incomeTable)
        .values({
          id: incomeId,
          userId: user?.id,
          description,
          amount,
        })
        .returning({
          id: incomeTable.id,
          description: incomeTable.description,
          amount: incomeTable.amount,
        })
      return c.json(income)
    } catch (error) {
      console.log(`error while creating income ${error}`)
      throw new HTTPException(500, { message: "Internal Server Error" })
    }
  })
  .get("/:id", checkAuth, async (c) => {
    const id = c.req.param("id")
    const income = await db.query.income.findFirst({
      where: eq(incomeTable.id, id),
    })
    if (!income) {
      throw new HTTPException(404, { message: "Income not found" })
    }
    return c.json(income)
  })
  .delete("/:id", checkAuth, async (c) => {
    const id = c.req.param("id")
    const user = c.get("user")
    const result = await db.transaction(async (tx) => {
      const income = await tx.query.income.findFirst({
        where: and(eq(incomeTable.id, id), eq(incomeTable.userId, user!.id)),
      })
      if (!income) {
        throw new HTTPException(404, { message: "Income not found" })
      }
      await tx.delete(incomeTable).where(eq(incomeTable.id, id))

      return c.json({ message: "Income deleted successfully" })
    })
  })
  .post(
    "/catgory",
    checkAuth,
    zValidator("json", incomeCategorySchema),
    async (c) => {
      const user = c.get("user")
      const { name, icon } = c.req.valid("json")
      const id = generateId(12)

      try {
        await db.insert(incomeCategoriesTable).values({
          id,
          icon,
          name,
          userId: user?.id,
        })
      } catch (error) {
        console.log(`error while creating income category ${error}`)
        throw new HTTPException(500, { message: "Internal Server Error" })
      }
    }
  )
