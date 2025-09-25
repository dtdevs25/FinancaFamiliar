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
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1 font-medium">Receitas do Mês</p>
            <p className="text-2xl font-bold text-white" data-testid="monthly-income">
              {formatCurrency(data.monthlyIncome)}
            </p>
            <p className="text-xs text-white/90 mt-1 flex items-center gap-1">
              <i className="fas fa-arrow-up"></i> +5.2% vs mês anterior
            </p>
          </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <i className="fas fa-trending-up text-white text-lg"></i>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Total Expenses */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-red-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1 font-medium">Gastos do Mês</p>
            <p className="text-2xl font-bold text-white" data-testid="monthly-expenses">
              {formatCurrency(data.monthlyExpenses)}
            </p>
            <p className="text-xs text-white/90 mt-1 flex items-center gap-1">
              <i className="fas fa-arrow-up"></i> +2.1% vs mês anterior
            </p>
          </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <i className="fas fa-credit-card text-white text-lg"></i>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Balance */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1 font-medium">Saldo do Mês</p>
            <p className="text-2xl font-bold text-white" data-testid="monthly-balance">
              {formatCurrency(data.monthlyBalance)}
            </p>
            <p className="text-xs text-white/90 mt-1 flex items-center gap-1">
              <i className="fas fa-arrow-up"></i> +12.3% vs mês anterior
            </p>
          </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <i className="fas fa-piggy-bank text-white text-lg"></i>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Upcoming Bills */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1 font-medium">Próximos Vencimentos</p>
            <p className="text-2xl font-bold text-white" data-testid="upcoming-bills">
              {data.upcomingBills} contas
            </p>
            <p className="text-xs text-white/90 mt-1">Próximos 7 dias</p>
          </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <i className="fas fa-clock text-white text-lg"></i>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
