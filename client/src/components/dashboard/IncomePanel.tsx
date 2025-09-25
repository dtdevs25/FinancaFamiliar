import type { Income } from "@shared/schema";

interface IncomePanelProps {
  incomes: Income[];
  onAddIncome: () => void;
}

export default function IncomePanel({ incomes, onAddIncome }: IncomePanelProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(amount));
  };

  const getIncomesBySource = () => {
    const danielIncomes = incomes.filter(i => i.source === "Daniel");
    const mariaIncomes = incomes.filter(i => i.source === "Maria");
    const extraIncomes = incomes.filter(i => i.source === "Extra");

    return { danielIncomes, mariaIncomes, extraIncomes };
  };

  const { danielIncomes, mariaIncomes, extraIncomes } = getIncomesBySource();

  const formatReceiptDate = (day: number | null) => {
    if (!day) return "";
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    return `${day.toString().padStart(2, '0')}/${currentMonth.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Receitas</h3>
        <button 
          className="text-primary hover:text-primary/80 text-sm font-medium"
          onClick={onAddIncome}
          data-testid="button-manage-income"
        >
          Gerenciar
        </button>
      </div>

      <div className="space-y-4">
        {/* Daniel's Income */}
        {danielIncomes.length > 0 && (
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">D</div>
              <div>
                <p className="font-medium text-foreground">Daniel</p>
                <p className="text-xs text-muted-foreground">Salário</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {danielIncomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between text-sm" data-testid={`income-daniel-${income.id}`}>
                  <span className="text-muted-foreground">
                    {income.receiptDay ? `${formatReceiptDate(income.receiptDay)} (${income.description})` : income.description}
                  </span>
                  <span className="font-medium text-success">
                    {formatCurrency(income.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wife's Income */}
        {mariaIncomes.length > 0 && (
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">M</div>
              <div>
                <p className="font-medium text-foreground">Maria</p>
                <p className="text-xs text-muted-foreground">Salário</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {mariaIncomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between text-sm" data-testid={`income-maria-${income.id}`}>
                  <span className="text-muted-foreground">
                    {income.receiptDay ? `${formatReceiptDate(income.receiptDay)} (${income.description})` : income.description}
                  </span>
                  <span className="font-medium text-success">
                    {formatCurrency(income.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extra Income */}
        <div className="border border-accent/20 rounded-lg p-4 bg-accent/5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-foreground">Receitas Extras</p>
            <button 
              className="text-accent hover:text-accent/80"
              onClick={onAddIncome}
              data-testid="button-add-extra-income"
            >
              <i className="fas fa-plus text-sm"></i>
            </button>
          </div>
          
          {extraIncomes.length > 0 ? (
            <div className="space-y-2">
              {extraIncomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between text-sm" data-testid={`income-extra-${income.id}`}>
                  <span className="text-muted-foreground">{income.description}</span>
                  <span className="font-medium text-accent">
                    {formatCurrency(income.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>PLR previsto para março</p>
              <p className="text-accent font-medium">R$ 1.500 (estimativa)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
