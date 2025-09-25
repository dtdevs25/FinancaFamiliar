import { 
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Bill, type InsertBill,
  type Income, type InsertIncome,
  type Transaction, type InsertTransaction,
  type Notification, type InsertNotification
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getCategory(id: string): Promise<Category | undefined>;

  // Bills
  getBills(userId: string): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | undefined>;
  createBill(userId: string, bill: InsertBill): Promise<Bill>;
  updateBill(id: string, bill: Partial<Bill>): Promise<Bill | undefined>;
  deleteBill(id: string): Promise<boolean>;

  // Incomes
  getIncomes(userId: string): Promise<Income[]>;
  getIncome(id: string): Promise<Income | undefined>;
  createIncome(userId: string, income: InsertIncome): Promise<Income>;
  updateIncome(id: string, income: Partial<Income>): Promise<Income | undefined>;
  deleteIncome(id: string): Promise<boolean>;

  // Transactions
  getTransactions(userId: string, month?: number, year?: number): Promise<Transaction[]>;
  createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined>;

  // Notifications
  getNotifications(userId: string, isRead?: boolean): Promise<Notification[]>;
  createNotification(userId: string, notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private bills: Map<string, Bill> = new Map();
  private incomes: Map<string, Income> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: "default-user-id",
      username: "daniel",
      password: "password123",
      email: "daniel@email.com",
      name: "Daniel"
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create default categories
    const defaultCategories: Category[] = [
      { id: "cat-1", name: "Casa e Utilidades", color: "#3B82F6", icon: "fas fa-home" },
      { id: "cat-2", name: "Alimentação", color: "#10B981", icon: "fas fa-utensils" },
      { id: "cat-3", name: "Transporte", color: "#F59E0B", icon: "fas fa-car" },
      { id: "cat-4", name: "Lazer", color: "#EF4444", icon: "fas fa-gamepad" },
      { id: "cat-5", name: "Saúde", color: "#8B5CF6", icon: "fas fa-heartbeat" },
    ];
    defaultCategories.forEach(cat => this.categories.set(cat.id, cat));

    // Create default bills
    const defaultBills: Bill[] = [
      {
        id: "bill-1",
        userId: defaultUser.id,
        categoryId: "cat-1",
        name: "Aluguel",
        description: "Apartamento",
        amount: "1800.00",
        dueDay: 10,
        isPaid: false,
        isRecurring: true,
        isInstallment: null,
        totalInstallments: null,
        currentInstallment: null,
        originalAmount: null,
        paymentDate: null,
        paymentMethod: null,
        paymentSource: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "bill-2", 
        userId: defaultUser.id,
        categoryId: "cat-1",
        name: "Energia Elétrica",
        description: "CPFL",
        amount: "180.00",
        dueDay: 15,
        isPaid: false,
        isRecurring: true,
        isInstallment: null,
        totalInstallments: null,
        currentInstallment: null,
        originalAmount: null,
        paymentDate: null,
        paymentMethod: null,
        paymentSource: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "bill-3",
        userId: defaultUser.id,
        categoryId: "cat-1", 
        name: "Água",
        description: "SABESP",
        amount: "85.50",
        dueDay: 20,
        isPaid: false,
        isRecurring: true,
        isInstallment: null,
        totalInstallments: null,
        currentInstallment: null,
        originalAmount: null,
        paymentDate: null,
        paymentMethod: null,
        paymentSource: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    defaultBills.forEach(bill => this.bills.set(bill.id, bill));

    // Create default incomes
    const defaultIncomes: Income[] = [
      {
        id: "income-1",
        userId: defaultUser.id,
        source: "Daniel",
        description: "Quinzena",
        amount: "2000.00",
        receiptDay: 15,
        isRecurring: true,
        date: null,
        createdAt: new Date()
      },
      {
        id: "income-2",
        userId: defaultUser.id,
        source: "Daniel", 
        description: "Salário",
        amount: "3500.00",
        receiptDay: 30,
        isRecurring: true,
        date: null,
        createdAt: new Date()
      },
      {
        id: "income-3",
        userId: defaultUser.id,
        source: "Maria",
        description: "Salário",
        amount: "2800.00",
        receiptDay: 5,
        isRecurring: true,
        date: null,
        createdAt: new Date()
      }
    ];
    defaultIncomes.forEach(income => this.incomes.set(income.id, income));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async getCategories(userId: string): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { 
      ...category, 
      id,
      color: category.color ?? "#3B82F6",
      icon: category.icon ?? "fas fa-tag"
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getBills(userId: string): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(bill => bill.userId === userId);
  }

  async getBill(id: string): Promise<Bill | undefined> {
    return this.bills.get(id);
  }

  async createBill(userId: string, bill: InsertBill): Promise<Bill> {
    const id = randomUUID();
    const newBill: Bill = {
      ...bill,
      id,
      userId,
      description: bill.description ?? null,
      categoryId: bill.categoryId ?? null,
      isRecurring: bill.isRecurring ?? true,
      isPaid: false,
      isInstallment: null,
      totalInstallments: null,
      currentInstallment: null,
      originalAmount: null,
      paymentDate: null,
      paymentMethod: null,
      paymentSource: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bills.set(id, newBill);
    return newBill;
  }

  async updateBill(id: string, bill: Partial<Bill>): Promise<Bill | undefined> {
    const existing = this.bills.get(id);
    if (!existing) return undefined;
    
    const updated: Bill = { ...existing, ...bill, updatedAt: new Date() };
    this.bills.set(id, updated);
    return updated;
  }

  async deleteBill(id: string): Promise<boolean> {
    return this.bills.delete(id);
  }

  async getIncomes(userId: string): Promise<Income[]> {
    return Array.from(this.incomes.values()).filter(income => income.userId === userId);
  }

  async getIncome(id: string): Promise<Income | undefined> {
    return this.incomes.get(id);
  }

  async createIncome(userId: string, income: InsertIncome): Promise<Income> {
    const id = randomUUID();
    const newIncome: Income = {
      ...income,
      id,
      userId,
      date: income.date ?? null,
      receiptDay: income.receiptDay ?? null,
      isRecurring: income.isRecurring ?? true,
      createdAt: new Date()
    };
    this.incomes.set(id, newIncome);
    return newIncome;
  }

  async updateIncome(id: string, income: Partial<Income>): Promise<Income | undefined> {
    const existing = this.incomes.get(id);
    if (!existing) return undefined;
    
    const updated: Income = { ...existing, ...income };
    this.incomes.set(id, updated);
    return updated;
  }

  async deleteIncome(id: string): Promise<boolean> {
    return this.incomes.delete(id);
  }

  async getTransactions(userId: string, month?: number, year?: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => {
      let matches = transaction.userId === userId;
      if (month !== undefined) matches = matches && transaction.month === month;
      if (year !== undefined) matches = matches && transaction.year === year;
      return matches;
    });
  }

  async createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      userId,
      isPaid: transaction.isPaid ?? false,
      billId: transaction.billId ?? null,
      incomeId: transaction.incomeId ?? null,
      createdAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;
    
    const updated: Transaction = { ...existing, ...transaction };
    this.transactions.set(id, updated);
    return updated;
  }

  async getNotifications(userId: string, isRead?: boolean): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => {
      let matches = notification.userId === userId;
      if (isRead !== undefined) matches = matches && notification.isRead === isRead;
      return matches;
    }).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(userId: string, notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      userId,
      relatedId: notification.relatedId ?? null,
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead);
    
    userNotifications.forEach(notification => {
      notification.isRead = true;
      this.notifications.set(notification.id, notification);
    });
    
    return true;
  }
}

export const storage = new MemStorage();
