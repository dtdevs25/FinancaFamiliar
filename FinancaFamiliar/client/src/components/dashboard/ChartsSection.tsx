import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartsSectionProps {
  data: {
    categoryBreakdown: Array<{
      id: string;
      name: string;
      color: string;
      totalAmount: number;
      percentage: number;
    }>;
  };
}

export default function ChartsSection({ data }: ChartsSectionProps) {
  // Mock data for monthly trend
  const monthlyTrendData = [
    { month: 'Ago', receitas: 8200, gastos: 6800 },
    { month: 'Set', receitas: 8100, gastos: 7100 },
    { month: 'Out', receitas: 8300, gastos: 6900 },
    { month: 'Nov', receitas: 8400, gastos: 6750 },
    { month: 'Dez', receitas: 8600, gastos: 6950 },
    { month: 'Jan', receitas: 8500, gastos: 6850 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Monthly Trend Chart */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Evolução Mensal</h3>
          <select className="text-sm border border-border rounded-lg px-3 py-1 bg-background" data-testid="chart-period-selector">
            <option>Últimos 6 meses</option>
            <option>Último ano</option>
          </select>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="receitas" fill="hsl(var(--success))" name="Receitas" />
              <Bar dataKey="gastos" fill="hsl(var(--destructive))" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Gastos por Categoria</h3>
          <button className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="view-all-categories">
            Ver todas
          </button>
        </div>
        
        <div className="space-y-4">
          {data.categoryBreakdown.slice(0, 4).map((category) => (
            <div key={category.id} className="flex items-center justify-between" data-testid={`category-${category.id}`}>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold">
                  {formatCurrency(category.totalAmount)}
                </span>
                <div className="text-xs text-muted-foreground">
                  {category.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bars for visual representation */}
        <div className="mt-4 space-y-2">
          {data.categoryBreakdown.slice(0, 1).map((category) => (
            <div key={`progress-${category.id}`} className="w-full bg-muted/20 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${category.percentage}%`,
                  backgroundColor: category.color 
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
