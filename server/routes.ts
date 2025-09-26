import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBillSchema, 
  updateBillSchema,
  insertIncomeSchema, 
  insertNotificationSchema,
  insertCategorySchema,
  insertGoalSchema,
  updateGoalSchema,
  insertActivityLogSchema
} from "@shared/schema";
import { getAIFinancialAdvice, analyzeBillPatterns, type FinancialData } from "./services/aiAssistant";
import { sendBillReminderEmail, sendOverdueNotificationEmail } from "./services/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard data
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const [bills, incomes, transactions, categories] = await Promise.all([
        storage.getBills(userId),
        storage.getIncomes(userId),
        storage.getTransactions(userId, currentMonth, currentYear),
        storage.getCategories(userId)
      ]);

      // Calculate monthly totals
      const monthlyIncome = incomes
        .filter(i => i.isRecurring)
        .reduce((sum, income) => sum + parseFloat(income.amount), 0);

      const monthlyExpenses = bills
        .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

      // Calculate category breakdown
      const categoryBreakdown = categories.map(category => {
        const categoryBills = bills.filter(b => b.categoryId === category.id);
        const totalAmount = categoryBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        const percentage = monthlyExpenses > 0 ? (totalAmount / monthlyExpenses) * 100 : 0;
        
        return {
          ...category,
          totalAmount,
          percentage: Math.round(percentage * 10) / 10
        };
      }).filter(c => c.totalAmount > 0);

      // Get upcoming bills (next 7 days)
      const today = currentDate.getDate();
      const upcomingBills = bills.filter(bill => {
        const daysUntilDue = bill.dueDay - today;
        return daysUntilDue >= 0 && daysUntilDue <= 7;
      }).length;

      res.json({
        monthlyIncome,
        monthlyExpenses,
        monthlyBalance: monthlyIncome - monthlyExpenses,
        upcomingBills,
        bills,
        incomes,
        categories,
        categoryBreakdown,
        transactions
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar dashboard" });
    }
  });

  // Bills routes
  app.get("/api/bills/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const bills = await storage.getBills(userId);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar contas" });
    }
  });

  app.post("/api/bills/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedBill = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(userId, validatedBill);
      
      // Log da atividade
      await storage.createActivityLog(userId, {
        action: "create",
        entityType: "bill",
        entityId: bill.id,
        message: `Conta "${bill.name}" foi criada`,
        metadata: JSON.stringify({ categoryId: bill.categoryId, amount: bill.amount })
      });
      
      res.status(201).json(bill);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para criação da conta" });
    }
  });

  app.patch("/api/bills/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateBillSchema.parse(req.body);
      const bill = await storage.updateBill(id, validatedData);
      if (!bill) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }
      
      // Log da atividade
      await storage.createActivityLog(bill.userId, {
        action: "update",
        entityType: "bill",
        entityId: bill.id,
        message: `Conta "${bill.name}" foi atualizada`,
        metadata: JSON.stringify({ changes: validatedData })
      });
      
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar conta" });
    }
  });

  app.delete("/api/bills/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Buscar a conta antes de deletar para pegar os dados
      const billToDelete = await storage.getBill(id);
      const deleted = await storage.deleteBill(id);
      if (!deleted) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }
      
      // Log da atividade
      if (billToDelete) {
        await storage.createActivityLog(billToDelete.userId, {
          action: "delete",
          entityType: "bill",
          entityId: id,
          message: `Conta "${billToDelete.name}" foi excluída`,
          metadata: JSON.stringify({ amount: billToDelete.amount })
        });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar conta" });
    }
  });

  // Incomes routes
  app.get("/api/incomes/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const incomes = await storage.getIncomes(userId);
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar receitas" });
    }
  });

  app.post("/api/incomes/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedIncome = insertIncomeSchema.parse(req.body);
      const income = await storage.createIncome(userId, validatedIncome);
      
      // Log da atividade
      await storage.createActivityLog(userId, {
        action: "create",
        entityType: "income",
        entityId: income.id,
        message: `Receita "${income.description}" foi criada`,
        metadata: JSON.stringify({ amount: income.amount, isRecurring: income.isRecurring })
      });
      
      res.status(201).json(income);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para criação da receita" });
    }
  });

  // Categories routes
  app.get("/api/categories/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar categorias" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedCategory = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedCategory);
      
      // Log da atividade (usando userId padrão pois a rota não tem userId)
      await storage.createActivityLog("default-user-id", {
        action: "create",
        entityType: "category",
        entityId: category.id,
        message: `Categoria "${category.name}" foi criada`,
        metadata: JSON.stringify({ color: category.color, icon: category.icon })
      });
      
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para criação da categoria" });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedCategory = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validatedCategory);
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      // Log da atividade (usando userId padrão)
      await storage.createActivityLog("default-user-id", {
        action: "update",
        entityType: "category",
        entityId: category.id,
        message: `Categoria "${category.name}" foi atualizada`,
        metadata: JSON.stringify({ changes: validatedCategory })
      });
      
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para atualização da categoria" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Buscar a categoria antes de deletar para pegar os dados
      const categoryToDelete = await storage.getCategory(id);
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(400).json({ message: "Não é possível excluir categoria que está sendo usada por contas existentes" });
      }
      
      // Log da atividade
      if (categoryToDelete) {
        await storage.createActivityLog("default-user-id", {
          action: "delete",
          entityType: "category",
          entityId: id,
          message: `Categoria "${categoryToDelete.name}" foi excluída`,
          metadata: JSON.stringify({ color: categoryToDelete.color })
        });
      }
      
      res.json({ message: "Categoria excluída com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { isRead } = req.query;
      const notifications = await storage.getNotifications(
        userId, 
        isRead !== undefined ? isRead === 'true' : undefined
      );
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar notificações" });
    }
  });

  app.post("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedNotification = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(userId, validatedNotification);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para criação da notificação" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNotificationAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Notificação não encontrada" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar notificação como lida" });
    }
  });

  app.patch("/api/notifications/:userId/read-all", async (req, res) => {
    try {
      const { userId } = req.params;
      const success = await storage.markAllNotificationsAsRead(userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar todas as notificações como lidas" });
    }
  });

  // AI Assistant routes
  app.post("/api/ai-advice/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [bills, incomes, categories] = await Promise.all([
        storage.getBills(userId),
        storage.getIncomes(userId),
        storage.getCategories(userId)
      ]);

      const monthlyIncome = incomes
        .filter(i => i.isRecurring)
        .reduce((sum, income) => sum + parseFloat(income.amount), 0);

      const monthlyExpenses = bills
        .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

      const categoryBreakdown = categories.map(category => {
        const categoryBills = bills.filter(b => b.categoryId === category.id);
        const totalAmount = categoryBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        const percentage = monthlyExpenses > 0 ? (totalAmount / monthlyExpenses) * 100 : 0;
        
        return {
          name: category.name,
          totalAmount,
          percentage: Math.round(percentage * 10) / 10
        };
      }).filter(c => c.totalAmount > 0);

      const financialData: FinancialData = {
        monthlyIncome,
        monthlyExpenses,
        bills: bills.map(b => ({
          name: b.name,
          amount: parseFloat(b.amount),
          category: categories.find(c => c.id === b.categoryId)?.name || "Outros",
          dueDay: b.dueDay
        })),
        categories: categoryBreakdown
      };

      const advice = await getAIFinancialAdvice(financialData);
      res.json(advice);
    } catch (error) {
      console.error("AI advice error:", error);
      res.status(500).json({ message: "Erro ao obter dicas da IA" });
    }
  });

  app.post("/api/ai-analysis/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [bills, incomes, categories] = await Promise.all([
        storage.getBills(userId),
        storage.getIncomes(userId),
        storage.getCategories(userId)
      ]);

      const monthlyIncome = incomes
        .filter(i => i.isRecurring)
        .reduce((sum, income) => sum + parseFloat(income.amount), 0);

      const monthlyExpenses = bills
        .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

      const financialData: FinancialData = {
        monthlyIncome,
        monthlyExpenses,
        bills: bills.map(b => ({
          name: b.name,
          amount: parseFloat(b.amount),
          category: categories.find(c => c.id === b.categoryId)?.name || "Outros",
          dueDay: b.dueDay
        })),
        categories: []
      };

      const analysis = await analyzeBillPatterns(financialData);
      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ message: "Erro ao obter análise da IA" });
    }
  });

  // Email notification routes
  app.post("/api/send-reminders/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const bills = await storage.getBills(userId);
      const today = new Date();
      const currentDay = today.getDate();

      // Find bills due in the next 3 days
      const upcomingBills = bills.filter(bill => {
        const daysUntilDue = bill.dueDay - currentDay;
        return daysUntilDue >= 0 && daysUntilDue <= 3;
      });

      const emailResults = await Promise.all(
        upcomingBills.map(bill => 
          sendBillReminderEmail(
            user.email || "daniel@email.com",
            user.name,
            bill.name,
            bill.amount,
            `${bill.dueDay}/${today.getMonth() + 1}/${today.getFullYear()}`
          )
        )
      );

      res.json({ 
        sent: emailResults.filter(Boolean).length,
        total: upcomingBills.length 
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao enviar lembretes" });
    }
  });

  // Activity Logs routes
  app.get("/api/logs/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      const activityLogs = await storage.getActivityLogs(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activityLogs);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar logs de atividade" });
    }
  });

  app.post("/api/logs/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedLog = insertActivityLogSchema.parse(req.body);
      const activityLog = await storage.createActivityLog(userId, validatedLog);
      res.status(201).json(activityLog);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para criação do log" });
    }
  });

  // Goals routes
  app.get("/api/goals/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar metas" });
    }
  });

  app.post("/api/goals/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedGoal = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(userId, validatedGoal);
      
      // Log da atividade
      await storage.createActivityLog(userId, {
        action: "create",
        entityType: "goal",
        entityId: goal.id,
        message: `Meta "${goal.name}" foi criada`,
        metadata: JSON.stringify({ targetAmount: goal.targetAmount, targetDate: goal.targetDate })
      });
      
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos para criação da meta" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateGoalSchema.parse(req.body);
      const goal = await storage.updateGoal(id, validatedData);
      if (!goal) {
        return res.status(404).json({ message: "Meta não encontrada" });
      }
      
      // Log da atividade
      await storage.createActivityLog(goal.userId, {
        action: "update",
        entityType: "goal",
        entityId: goal.id,
        message: `Meta "${goal.name}" foi atualizada`,
        metadata: JSON.stringify({ changes: validatedData })
      });
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar meta" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Buscar a meta antes de deletar para pegar os dados
      const goalToDelete = await storage.getGoal(id);
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Meta não encontrada" });
      }
      
      // Log da atividade
      if (goalToDelete) {
        await storage.createActivityLog(goalToDelete.userId, {
          action: "delete",
          entityType: "goal",
          entityId: id,
          message: `Meta "${goalToDelete.name}" foi excluída`,
          metadata: JSON.stringify({ targetAmount: goalToDelete.targetAmount })
        });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar meta" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
