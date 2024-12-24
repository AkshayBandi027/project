import { pgTable, text, numeric, timestamp } from "drizzle-orm/pg-core"

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  hashedPassword: text("hashed_password").notNull(),
  email: text("email").notNull(),
})

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
})

export const expensesTable = pgTable("expenses", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  description: text("title").notNull(),
  amount: numeric("amount").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => expenseCatgoriesTable.id),
  transactionDate: timestamp("transaction_date", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
})

export const expenseCatgoriesTable = pgTable("expense_categories", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .references(() => userTable.id)
    .notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
})

export const incomeTable = pgTable("income", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => incomeCategoriesTable.id),
  transactionDate: timestamp("transaction_date", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
})

export const incomeCategoriesTable = pgTable("income_categories", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
})
