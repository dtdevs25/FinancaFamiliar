import { TrendingUp, CreditCard, Wallet, Clock } from "lucide-react";

interface FinancialSummaryCardsProps {
  data: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyBalance: number;
    upcomingBills: number;
  };
}

export default function FinancialSummaryCards({ data }: FinancialSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Income */}
      <div className="relative bg-white dark:bg-gray-900 border-l-4 border-emerald-500 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Receitas do Mês</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="monthly-income">
              {formatCurrency(data.monthlyIncome)}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> +5.2% vs mês anterior
            </p>
          </div>
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
          </div>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="relative bg-white dark:bg-gray-900 border-l-4 border-red-500 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Gastos do Mês</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="monthly-expenses">
              {formatCurrency(data.monthlyExpenses)}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> +2.1% vs mês anterior
            </p>
          </div>
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <CreditCard className="text-red-600 dark:text-red-400" size={24} />
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="relative bg-white dark:bg-gray-900 border-l-4 border-blue-500 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Saldo do Mês</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="monthly-balance">
              {formatCurrency(data.monthlyBalance)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> +12.3% vs mês anterior
            </p>
          </div>
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
        </div>
      </div>

      {/* Upcoming Bills */}
      <div className="relative bg-white dark:bg-gray-900 border-l-4 border-amber-500 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Próximos Vencimentos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="upcoming-bills">
              {data.upcomingBills} contas
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Próximos 7 dias</p>
          </div>
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Clock className="text-amber-600 dark:text-amber-400" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
