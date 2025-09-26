import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Plus, Target, TrendingUp, DollarSign, Edit, Trash2, Calendar } from "lucide-react";
import type { Goal } from "@shared/schema";
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
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalForm, setGoalForm] = useState({
    name: "",
    description: "",
    type: "",
    targetAmount: "",
    period: "monthly",
    targetDate: "",
    categoryId: "",
    color: "#3B82F6",
    icon: "fas fa-bullseye"
  });
  const userId = "default-user-id";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", userId],
  });

  const { data: bills = [] } = useQuery({
    queryKey: ["/api/bills", userId],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", userId],
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["/api/goals", userId],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      return apiRequest("POST", `/api/goals/${userId}`, goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsGoalModalOpen(false);
      resetGoalForm();
      toast({
        title: "Meta criada",
        description: "Sua meta financeira foi criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar meta financeira.",
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, data }: { goalId: string; data: any }) => {
      return apiRequest("PATCH", `/api/goals/${goalId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsGoalModalOpen(false);
      setSelectedGoal(null);
      resetGoalForm();
      toast({
        title: "Meta atualizada",
        description: "Sua meta financeira foi atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar meta financeira.",
        variant: "destructive",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      return apiRequest("DELETE", `/api/goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta excluída",
        description: "Sua meta financeira foi removida com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir meta financeira.",
        variant: "destructive",
      });
    },
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

  const resetGoalForm = () => {
    setGoalForm({
      name: "",
      description: "",
      type: "",
      targetAmount: "",
      period: "monthly",
      targetDate: "",
      categoryId: "",
      color: "#3B82F6",
      icon: "fas fa-bullseye"
    });
  };

  const handleCreateGoal = () => {
    setSelectedGoal(null);
    resetGoalForm();
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setGoalForm({
      name: goal.name,
      description: goal.description || "",
      type: goal.type,
      targetAmount: goal.targetAmount,
      period: goal.period,
      targetDate: goal.targetDate || "",
      categoryId: goal.categoryId || "",
      color: goal.color,
      icon: goal.icon
    });
    setIsGoalModalOpen(true);
  };

  const handleGoalSubmit = () => {
    if (!goalForm.name || !goalForm.type || !goalForm.targetAmount) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const goalData = {
      ...goalForm,
      categoryId: goalForm.categoryId || null,
      targetDate: goalForm.targetDate || null,
    };

    if (selectedGoal) {
      updateGoalMutation.mutate({ goalId: selectedGoal.id, data: goalData });
    } else {
      createGoalMutation.mutate(goalData);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const getGoalProgress = (goal: Goal) => {
    const current = parseFloat(goal.currentAmount);
    const target = parseFloat(goal.targetAmount);
    return target > 0 ? (current / target) * 100 : 0;
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case "savings":
        return <Target className="w-5 h-5" />;
      case "expense_limit":
        return <TrendingUp className="w-5 h-5" />;
      case "income_target":
        return <DollarSign className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case "savings":
        return "Economia";
      case "expense_limit":
        return "Limite de Gasto";
      case "income_target":
        return "Meta de Receita";
      default:
        return "Outro";
    }
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Metas Financeiras</h3>
                <p className="text-muted-foreground">Crie e acompanhe suas metas de economia, gastos e receitas</p>
              </div>
              <Button onClick={handleCreateGoal} className="flex items-center gap-2" data-testid="button-create-goal">
                <Plus size={16} />
                Nova Meta
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal: Goal) => {
                const progress = getGoalProgress(goal);
                const category = categories.find((c: any) => c.id === goal.categoryId);
                
                return (
                  <Card key={goal.id} className="relative overflow-hidden hover:shadow-lg transition-all duration-300" data-testid={`goal-card-${goal.id}`}>
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(90deg, ${goal.color} ${progress}%, #e5e7eb ${progress}%)`
                      }}
                    />
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: goal.color }}
                          >
                            {getGoalIcon(goal.type)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                            <CardDescription>{getGoalTypeLabel(goal.type)}</CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                            data-testid={`button-edit-goal-${goal.id}`}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                            data-testid={`button-delete-goal-${goal.id}`}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                        
                        {category && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm text-muted-foreground">{category.name}</span>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Progresso</span>
                            <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ 
                                width: `${Math.min(progress, 100)}%`,
                                backgroundColor: progress > 100 ? '#EF4444' : goal.color
                              }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>R$ {parseFloat(goal.currentAmount).toFixed(2)}</span>
                            <span>R$ {parseFloat(goal.targetAmount).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar size={12} />
                            <span className="capitalize">{goal.period === 'monthly' ? 'Mensal' : goal.period === 'yearly' ? 'Anual' : 'Personalizado'}</span>
                          </div>
                          
                          <Badge 
                            variant={goal.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {goal.isActive ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {goals.length === 0 && (
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                      <Target className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Nenhuma meta criada
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4 max-w-md">
                      Crie suas primeira meta financeira para começar a acompanhar seus objetivos de economia, gastos ou receitas.
                    </p>
                    <Button onClick={handleCreateGoal} className="flex items-center gap-2">
                      <Plus size={16} />
                      Criar Primeira Meta
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Criação/Edição de Meta */}
        <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="text-blue-600" size={20} />
                {selectedGoal ? "Editar Meta" : "Nova Meta Financeira"}
              </DialogTitle>
              <DialogDescription>
                {selectedGoal 
                  ? "Modifique as informações da sua meta financeira"
                  : "Defina uma nova meta para acompanhar seus objetivos financeiros"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="goal-name">Nome da Meta *</Label>
                  <Input
                    id="goal-name"
                    type="text"
                    value={goalForm.name}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Economia para viagem"
                    data-testid="input-goal-name"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="goal-description">Descrição</Label>
                  <Textarea
                    id="goal-description"
                    value={goalForm.description}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição opcional da meta"
                    data-testid="input-goal-description"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goal-type">Tipo de Meta *</Label>
                  <Select 
                    value={goalForm.type} 
                    onValueChange={(value) => setGoalForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="select-goal-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Economia</SelectItem>
                      <SelectItem value="expense_limit">Limite de Gasto</SelectItem>
                      <SelectItem value="income_target">Meta de Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="goal-amount">Valor Alvo *</Label>
                  <Input
                    id="goal-amount"
                    type="number"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    data-testid="input-goal-amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goal-period">Período</Label>
                  <Select 
                    value={goalForm.period} 
                    onValueChange={(value) => setGoalForm(prev => ({ ...prev, period: value }))}
                  >
                    <SelectTrigger data-testid="select-goal-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="goal-category">Categoria</Label>
                  <Select 
                    value={goalForm.categoryId} 
                    onValueChange={(value) => setGoalForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger data-testid="select-goal-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma categoria</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {goalForm.period === "custom" && (
                  <div>
                    <Label htmlFor="goal-target-date">Data Alvo</Label>
                    <Input
                      id="goal-target-date"
                      type="date"
                      value={goalForm.targetDate}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                      data-testid="input-goal-target-date"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="goal-color">Cor</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="goal-color"
                      type="color"
                      value={goalForm.color}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 p-1 rounded"
                      data-testid="input-goal-color"
                    />
                    <Input
                      type="text"
                      value={goalForm.color}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="goal-icon">Ícone</Label>
                  <Input
                    id="goal-icon"
                    type="text"
                    value={goalForm.icon}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="fas fa-bullseye"
                    data-testid="input-goal-icon"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: goalForm.color }}
                  >
                    <i className={`${goalForm.icon} text-sm`}></i>
                  </div>
                  <div>
                    <p className="font-medium">
                      {goalForm.name || "Nome da Meta"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {goalForm.type ? getGoalTypeLabel(goalForm.type) : "Tipo de Meta"}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-bold text-lg">
                      R$ {goalForm.targetAmount || "0,00"}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {goalForm.period === 'monthly' ? 'Mensal' : goalForm.period === 'yearly' ? 'Anual' : 'Personalizado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsGoalModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleGoalSubmit} 
                disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-save-goal"
              >
                {(createGoalMutation.isPending || updateGoalMutation.isPending) ? "Salvando..." : (
                  <>
                    <Target size={16} />
                    {selectedGoal ? "Atualizar Meta" : "Criar Meta"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}