import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, date, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  name: text("name").notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3B82F6"),
  icon: text("icon").notNull().default("fas fa-tag"),
});

export const bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDay: integer("due_day").notNull(), // Day of month (1-31)
  isPaid: boolean("is_paid").default(false),
  isRecurring: boolean("is_recurring").default(true),
  // Campos para sistema de parcelas
  isInstallment: boolean("is_installment").default(false),
  totalInstallments: integer("total_installments"),
  currentInstallment: integer("current_installment"),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }), // Valor total original
  // Campos de pagamento
  paymentDate: date("payment_date"),
  paymentMethod: text("payment_method"), // "pix", "credit", "debit", "cash", etc.
  paymentSource: text("payment_source"), // "Cartão de Crédito Dani", "Conta Corrente João", etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const incomes = pgTable("incomes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  source: text("source").notNull(), // "Daniel", "Maria", "Extra"
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  receiptDay: integer("receipt_day"), // Day of month for recurring income
  isRecurring: boolean("is_recurring").default(true),
  date: date("date"), // For one-time incomes
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  billId: varchar("bill_id").references(() => bills.id),
  incomeId: varchar("income_id").references(() => incomes.id),
  type: text("type").notNull(), // "expense" or "income"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "warning", "info", "success", "error"
  isRead: boolean("is_read").default(false),
  relatedId: varchar("related_id"), // Reference to bill/income/transaction
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "savings" (economia), "expense_limit" (limite de gasto), "income_target" (meta de receita)
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  period: text("period").notNull(), // "monthly", "yearly", "custom"
  targetDate: date("target_date"), // Para metas com prazo específico
  isActive: boolean("is_active").default(true),
  color: text("color").default("#3B82F6"),
  icon: text("icon").default("fas fa-bullseye"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // "create", "update", "delete", "payment"
  entityType: text("entity_type").notNull(), // "bill", "income", "category", "goal"
  entityId: varchar("entity_id"), // Reference to the affected entity
  message: text("message").notNull(), // Human-readable description
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
  icon: true,
});

export const insertBillSchema = createInsertSchema(bills).pick({
  categoryId: true,
  name: true,
  description: true,
  amount: true,
  dueDay: true,
  isRecurring: true,
  isInstallment: true,
  totalInstallments: true,
  currentInstallment: true,
  originalAmount: true,
});

export const updateBillSchema = createInsertSchema(bills).pick({
  categoryId: true,
  name: true,
  description: true,
  amount: true,
  dueDay: true,
  isRecurring: true,
  isPaid: true,
  isInstallment: true,
  totalInstallments: true,
  currentInstallment: true,
  originalAmount: true,
  paymentDate: true,
  paymentMethod: true,
  paymentSource: true,
}).partial().extend({
  paymentDate: z.string().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  paymentSource: z.string().nullable().optional(),
});

export const insertIncomeSchema = createInsertSchema(incomes).pick({
  source: true,
  description: true,
  amount: true,
  receiptDay: true,
  isRecurring: true,
  date: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  billId: true,
  incomeId: true,
  type: true,
  amount: true,
  date: true,
  month: true,
  year: true,
  isPaid: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  title: true,
  message: true,
  type: true,
  relatedId: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  categoryId: true,
  name: true,
  description: true,
  type: true,
  targetAmount: true,
  period: true,
  targetDate: true,
  color: true,
  icon: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  action: true,
  entityType: true,
  entityId: true,
  message: true,
  metadata: true,
});

export const updateGoalSchema = createInsertSchema(goals).pick({
  categoryId: true,
  name: true,
  description: true,
  type: true,
  targetAmount: true,
  currentAmount: true,
  period: true,
  targetDate: true,
  isActive: true,
  color: true,
  icon: true,
}).partial();

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;

export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof incomes.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
