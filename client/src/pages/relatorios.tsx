import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from "recharts";

export default function RelatoriosPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes-atual");
  const userId = "default-user-id";

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", userId],
  });

  const { data: bills = [] } = useQuery({
    queryKey: ["/api/bills", userId],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", userId],
  });

  // Preparar dados para gráficos interativos
  const categoryData = categories?.map((category: any) => {
    const categoryBills = bills.filter((bill: any) => bill.categoryId === category.id);
    const totalAmount = categoryBills.reduce((sum: number, bill: any) => sum + parseFloat(bill.amount), 0);
    
    return {
      name: category.name,
      value: totalAmount,
      color: category.color,
      icon: category.icon,
      bills: categoryBills.length
    };
  }).filter((cat: any) => cat.value > 0) || [];

  // Dados mensais simulados para gráfico de tendência
  const monthlyData = [
    { month: "Jan", receitas: 8300, despesas: 7200, economia: 1100 },
    { month: "Fev", receitas: 8300, despesas: 6900, economia: 1400 },
    { month: "Mar", receitas: 8500, despesas: 7100, economia: 1400 },
    { month: "Abr", receitas: 8300, despesas: 7300, economia: 1000 },
    { month: "Mai", receitas: 8300, despesas: 6800, economia: 1500 },
    { month: "Jun", receitas: 8600, despesas: 7000, economia: 1600 },
  ];

  // Cores vibrantes para os gráficos
  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

  const handleCategoryClick = (data: any) => {
    console.log("Clicou na categoria:", data);
    // Aqui poderia navegar para detalhes da categoria ou mostrar modal
  };

  const handleBarClick = (data: any, index: number) => {
    console.log("Clicou no período:", data);
    // Aqui poderia mostrar detalhes do mês específico
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios Financeiros</h1>
              <p className="text-muted-foreground">
                Análise detalhada das suas finanças com gráficos interativos
              </p>
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes-atual">Mês Atual</SelectItem>
                <SelectItem value="trimestre">Últimos 3 meses</SelectItem>
                <SelectItem value="semestre">Últimos 6 meses</SelectItem>
                <SelectItem value="ano">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
            <TabsTrigger value="tendencias">Tendências</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {dashboardData?.monthlyIncome?.toFixed(2) || "0,00"}
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Totais</CardTitle>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {dashboardData?.monthlyExpenses?.toFixed(2) || "0,00"}
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {dashboardData?.monthlyBalance?.toFixed(2) || "0,00"}
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Economia</CardTitle>
                  <div className="text-2xl font-bold text-orange-600">
                    {dashboardData?.monthlyIncome && dashboardData?.monthlyBalance 
                      ? ((dashboardData.monthlyBalance / dashboardData.monthlyIncome) * 100).toFixed(1)
                      : "0"}%
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Gráfico de Receitas vs Despesas */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal - Receitas vs Despesas</CardTitle>
                <CardDescription>Clique nas barras para ver detalhes do período</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyData} onClick={handleBarClick}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, ""]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: '#f9fafb', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="receitas" fill="#10B981" name="Receitas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Pizza Interativo */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>Clique nas fatias para ver detalhes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        onClick={handleCategoryClick}
                        style={{ cursor: 'pointer' }}
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Valor"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Lista de Categorias */}
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Categorias</CardTitle>
                  <CardDescription>Maiores gastos por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData
                      .sort((a: any, b: any) => b.value - a.value)
                      .map((category: any, index: number) => (
                        <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: category.color }}
                            >
                              <i className={`${category.icon} text-white text-sm`}></i>
                            </div>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {category.bills} conta{category.bills > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">R$ {category.value.toFixed(2)}</div>
                            <Badge variant="secondary">
                              #{index + 1}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tendencias" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Economia</CardTitle>
                <CardDescription>Evolução do seu saldo mensal ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, ""]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="economia" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                      strokeWidth={3}
                      name="Economia"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Linha de Receitas e Despesas</CardTitle>
                <CardDescription>Comparação detalhada mês a mês</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, ""]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="receitas" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      name="Receitas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="despesas" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      name="Despesas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Metas Financeiras</CardTitle>
                <CardDescription>Acompanhe o progresso das suas metas de economia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Meta de Economia */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Meta de Economia Mensal</h3>
                      <Badge variant="outline">R$ 1.500,00</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((dashboardData?.monthlyBalance || 0) / 1500 * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>R$ {dashboardData?.monthlyBalance?.toFixed(2) || "0,00"} economizado</span>
                      <span>{Math.min(((dashboardData?.monthlyBalance || 0) / 1500 * 100), 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Meta por Categoria */}
                  <div className="p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3">Limite de Gastos por Categoria</h3>
                    <div className="space-y-3">
                      {categoryData.slice(0, 3).map((category: any) => (
                        <div key={category.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">
                              R$ {category.value.toFixed(2)} / R$ 2.000,00
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min((category.value / 2000) * 100, 100)}%`,
                                backgroundColor: category.value > 2000 ? '#EF4444' : category.color
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}