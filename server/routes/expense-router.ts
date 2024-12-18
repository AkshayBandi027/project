import { Hono } from "hono";
import type { Context } from "../context";
import { zValidator } from "@hono/zod-validator";
import { expenseSchema } from "../../shared/types";
import { HTTPException } from "hono/http-exception";
import { db } from "../db-adapter";
import { expensesTable } from "../db/schema";

// add the auth middleware to check the user is authenticated.

export const expenseRouter = new Hono<Context>().post("/", zValidator("json",expenseSchema), async(c) => {
    const {title,amount} = c.req.valid("json") 
    const user = c.var.user

    try {
        await db.insert(expensesTable).values({
            userId: user?.id as string,
            title,  
            amount, 
        })
    }catch (error) {
        console.log(`error while creating expense ${error}`)
        throw new HTTPException(500, {message: "Internal Server Error"})
    }
})