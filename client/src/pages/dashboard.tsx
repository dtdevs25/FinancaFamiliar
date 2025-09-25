import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Bill, Income, Category, Notification } from "@shared/schema";
import FinancialSummaryCards from "@/components/dashboard/FinancialSummaryCards";
import ChartsSection from "@/components/dashboard/ChartsSection";
import BillsTable from "@/components/dashboard/BillsTable";
import IncomePanel from "@/components/dashboard/IncomePanel";
import CalendarView from "@/components/dashboard/CalendarView";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import AIAssistant from "@/components/dashboard/AIAssistant";
import AddBillModal from "@/components/modals/AddBillModal";
import AddIncomeModal from "@/components/modals/AddIncomeModal";

// Interface para os dados do dashboard
interface DashboardData {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  upcomingBills: number;
  bills: Bill[];
  incomes: Income[];
  categories: Category[];
  categoryBreakdown: Array<{
    id: string;
    name: string;
    color: string;
    totalAmount: number;
    percentage: number;
  }>;
}

export default function Dashboard() {
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  
  const userId = "default-user-id"; // In real app, get from auth context

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard", userId],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", userId],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mt-2">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-safe">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with AI Assistant */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Olá, Daniel!</h2>
              <p className="text-muted-foreground">
                Aqui está o resumo financeiro da sua família em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            <AIAssistant userId={userId} />
          </div>
        </div>

        {/* Financial Summary Cards */}
        <FinancialSummaryCards data={dashboardData} />

        {/* Charts Section */}
        <ChartsSection data={dashboardData} />

        {/* Bills and Income Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <BillsTable 
              bills={dashboardData.bills} 
              categories={dashboardData.categories}
              onAddBill={() => setIsAddBillModalOpen(true)}
            />
          </div>
          
          <IncomePanel 
            incomes={dashboardData.incomes}
            onAddIncome={() => setIsAddIncomeModalOpen(true)}
          />
        </div>

        {/* Calendar and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CalendarView 
            bills={dashboardData.bills}
            incomes={dashboardData.incomes}
          />
          
          <div className="space-y-6">
            <NotificationsPanel 
              notifications={notifications || []}
              userId={userId}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddBillModal 
        isOpen={isAddBillModalOpen}
        onClose={() => setIsAddBillModalOpen(false)}
        categories={dashboardData.categories}
        userId={userId}
      />
      
      <AddIncomeModal 
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        userId={userId}
      />

    </div>
  );
}
