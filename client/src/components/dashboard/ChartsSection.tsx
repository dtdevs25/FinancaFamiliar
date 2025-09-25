import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface ChartsSectionProps {
  data: {
    categoryBreakdown: Array<{
      id: string;
      name: string;
      color: string;
      totalAmount: number;
      percentage: number;
    }>;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
}

export default function ChartsSection({ data }: ChartsSectionProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Cores vibrantes para os gráficos
  const VIBRANT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'];

  // Mock data for monthly trend with more vibrant data
  const monthlyTrendData = [
    { month: 'Jul', receitas: 8000, gastos: 6500, economia: 1500 },
    { month: 'Ago', receitas: 8200, gastos: 6800, economia: 1400 },
    { month: 'Set', receitas: 8100, gastos: 7100, economia: 1000 },
    { month: 'Out', receitas: 8300, gastos: 6900, economia: 1400 },
    { month: 'Nov', receitas: 8400, gastos: 6750, economia: 1650 },
    { month: 'Dez', receitas: 8600, gastos: 6950, economia: 1650 },
  ];

  // Preparar dados do gráfico de pizza com cores vibrantes
  const pieData = data.categoryBreakdown.map((category, index) => ({
    ...category,
    color: category.color || VIBRANT_COLORS[index % VIBRANT_COLORS.length],
    value: category.totalAmount
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Função para lidar com cliques nos gráficos
  const handleChartClick = (data: any, chartType: string) => {
    toast({
      title: "Navegando para detalhes",
      description: `Visualizando dados de ${chartType}`,
    });
    
    if (chartType === 'categoria') {
      setLocation('/relatorios');
    } else if (chartType === 'mensal') {
      setLocation('/calendario');
    }
  };

  const handlePieClick = (data: any, index: number) => {
    toast({
      title: `Categoria: ${data.name}`,
      description: `${formatCurrency(data.value)} (${data.percentage.toFixed(1)}%)`,
    });
    setLocation('/contas');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Enhanced Monthly Trend Chart */}
      <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Evolução Mensal</h3>
            <p className="text-sm text-muted-foreground">Clique nas barras para ver detalhes no calendário</p>
          </div>
          <select className="text-sm border border-border rounded-lg px-3 py-1 bg-background" data-testid="chart-period-selector">
            <option>Últimos 6 meses</option>
            <option>Último ano</option>
          </select>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={monthlyTrendData} 
              onClick={(data: any) => handleChartClick(data, 'mensal')}
              style={{ cursor: 'pointer' }}
            >
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorEconomia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tickFormatter={formatCurrency} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="receitas" 
                stroke="#10B981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorReceitas)" 
                name="Receitas"
              />
              <Area 
                type="monotone" 
                dataKey="gastos" 
                stroke="#EF4444" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorGastos)" 
                name="Gastos"
              />
              <Area 
                type="monotone" 
                dataKey="economia" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEconomia)" 
                name="Economia"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Pie Chart */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Distribuição por Categoria</h3>
            <p className="text-xs text-muted-foreground">Clique nas fatias para detalhes</p>
          </div>
        </div>
        
        {pieData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={handlePieClick}
                  style={{ cursor: 'pointer' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                      style={{
                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <i className="fas fa-chart-pie text-4xl mb-4 opacity-50"></i>
              <p className="text-sm">Nenhuma categoria encontrada</p>
            </div>
          </div>
        )}

        {/* Enhanced Category Legend */}
        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
          {pieData.slice(0, 5).map((category, index) => (
            <div 
              key={category.id} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors"
              onClick={() => handleChartClick(category, 'categoria')}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full shadow-sm" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-xs font-medium truncate">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold">{formatCurrency(category.totalAmount)}</div>
                <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
