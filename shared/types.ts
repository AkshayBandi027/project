
import { z } from "zod";

export const signUpSchema = z.object({
    username: z.string().min(3).max(30),
    password: z.string().min(3).max(30),
    email: z.string().email(),
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(3).max(30),
})

export const expenseSchema = z.object({
    description: z.string().min(3).max(30),
    amount: z.number().min(1).max(100000),
})

export const expenseCategorySchema = z.object({
    name: z.string().min(3).max(30),
    icon: z.string().min(3).max(30),
})

export const incomeSchema = z.object({
    description: z.string().min(3).max(30),
    amount: z.number().min(1).max(100000),
})

export const incomeCategorySchema = z.object({
    name: z.string().min(3).max(30),    
    icon: z.string().min(3).max(30),
})