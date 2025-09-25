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
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Receitas do Mês</p>
            <p className="text-2xl font-bold text-success" data-testid="monthly-income">
              {formatCurrency(data.monthlyIncome)}
            </p>
            <p className="text-xs text-success mt-1">
              <i className="fas fa-arrow-up"></i> +5.2% vs mês anterior
            </p>
          </div>
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
            <i className="fas fa-arrow-trend-up text-success"></i>
          </div>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Gastos do Mês</p>
            <p className="text-2xl font-bold text-destructive" data-testid="monthly-expenses">
              {formatCurrency(data.monthlyExpenses)}
            </p>
            <p className="text-xs text-destructive mt-1">
              <i className="fas fa-arrow-up"></i> +2.1% vs mês anterior
            </p>
          </div>
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <i className="fas fa-arrow-trend-down text-destructive"></i>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saldo do Mês</p>
            <p className="text-2xl font-bold text-success" data-testid="monthly-balance">
              {formatCurrency(data.monthlyBalance)}
            </p>
            <p className="text-xs text-success mt-1">
              <i className="fas fa-arrow-up"></i> +12.3% vs mês anterior
            </p>
          </div>
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
            <i className="fas fa-piggy-bank text-accent"></i>
          </div>
        </div>
      </div>

      {/* Upcoming Bills */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Próximos Vencimentos</p>
            <p className="text-2xl font-bold text-warning" data-testid="upcoming-bills">
              {data.upcomingBills} contas
            </p>
            <p className="text-xs text-muted-foreground mt-1">Próximos 7 dias</p>
          </div>
          <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
            <i className="fas fa-clock text-warning"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
