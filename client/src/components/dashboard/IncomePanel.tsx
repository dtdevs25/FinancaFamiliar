import type { Income } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, User, Users } from "lucide-react";

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
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Receitas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Acompanhe suas fontes de renda</p>
            </div>
          </div>
          <Button variant="outline" onClick={onAddIncome} className="flex items-center gap-2" data-testid="button-manage-income">
            <Plus size={16} />
            Gerenciar
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Daniel's Income */}
        {danielIncomes.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-l-4 border-blue-500 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Daniel</p>
                <Badge variant="secondary" className="text-xs">Salário Principal</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              {danielIncomes.map((income) => (
                <div key={income.id} className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 flex items-center justify-between" data-testid={`income-daniel-${income.id}`}>
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {income.description}
                    </span>
                    {income.receiptDay && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Recebimento: {formatReceiptDate(income.receiptDay)}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {formatCurrency(income.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wife's Income */}
        {mariaIncomes.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-l-4 border-purple-500 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Maria</p>
                <Badge variant="secondary" className="text-xs">Salário Principal</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              {mariaIncomes.map((income) => (
                <div key={income.id} className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 flex items-center justify-between" data-testid={`income-maria-${income.id}`}>
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {income.description}
                    </span>
                    {income.receiptDay && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Recebimento: {formatReceiptDate(income.receiptDay)}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {formatCurrency(income.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extra Income */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border-l-4 border-amber-500 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
                <Plus className="text-white" size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Receitas Extras</p>
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-300">Renda Adicional</Badge>
              </div>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={onAddIncome}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
              data-testid="button-add-extra-income"
            >
              <Plus size={16} />
            </Button>
          </div>
          
          {extraIncomes.length > 0 ? (
            <div className="space-y-3">
              {extraIncomes.map((income) => (
                <div key={income.id} className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 flex items-center justify-between" data-testid={`income-extra-${income.id}`}>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{income.description}</span>
                  <span className="font-bold text-lg text-amber-600 dark:text-amber-400">
                    {formatCurrency(income.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">PLR previsto para março</p>
              <p className="font-semibold text-amber-600 dark:text-amber-400">R$ 1.500 (estimativa)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
