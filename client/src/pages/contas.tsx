import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Grid3X3, List, Edit, Calendar, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";
import AddBillModal from "@/components/modals/AddBillModal";

export default function ContasPage() {
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editedAmount, setEditedAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const userId = "default-user-id"; // Em produção, vem do sistema de autenticação

  const { data: bills = [] } = useQuery({
    queryKey: ["/api/bills", userId],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", userId],
  });

  const updateBillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/bills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao atualizar conta");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", userId] });
      setIsEditModalOpen(false);
      toast({
        title: "Conta atualizada",
        description: "A conta foi atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar a conta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Filtrar contas pelo termo de pesquisa
  const filteredBills = Array.isArray(bills) ? bills.filter((bill: any) => 
    bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Adicionar informações de tipo para todas as contas
  const allBillsWithType = filteredBills.map((bill: any) => ({
    ...bill,
    billType: bill.isRecurring && !bill.installments 
      ? 'fixa' 
      : bill.installments 
        ? 'parcelada' 
        : 'avulsa'
  }));
  
  const getBillTypeInfo = (type: string) => {
    switch(type) {
      case 'fixa':
        return { label: 'Fixa', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: CreditCard };
      case 'parcelada':
        return { label: 'Parcelada', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', icon: Clock };
      case 'avulsa':
        return { label: 'Avulsa', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle };
      default:
        return { label: 'Única', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: AlertCircle };
    }
  };

  // Para compatibilidade com código antigo (remover depois)
  const contasFixas = filteredBills.filter((bill: any) => bill.isRecurring && !bill.installments);
  const contasParceladas = filteredBills.filter((bill: any) => bill.installments);
  const contasAvulsas = filteredBills.filter((bill: any) => !bill.isRecurring && !bill.installments);

  const getCategoryInfo = (categoryId: string) => {
    return Array.isArray(categories) ? categories.find((cat: any) => cat.id === categoryId) || { name: "Outros", color: "#6B7280", icon: "fas fa-tag" } : { name: "Outros", color: "#6B7280", icon: "fas fa-tag" };
  };

  const handleEditAmount = (bill: any) => {
    setSelectedBill(bill);
    setEditedAmount(bill.amount);
    setIsEditModalOpen(true);
  };

  const handleSaveAmount = () => {
    if (selectedBill && editedAmount) {
      updateBillMutation.mutate({
        id: selectedBill.id,
        data: { amount: editedAmount }
      });
    }
  };

  const BillCard = ({ bill }: { bill: any }) => {
    const category = getCategoryInfo(bill.categoryId);
    const typeInfo = getBillTypeInfo(bill.billType);
    const TypeIcon = typeInfo.icon;
    
    if (viewMode === "list") {
      return (
        <div className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md" data-testid={`bill-${bill.id}`}>
          <div className="flex items-center space-x-4">
            <div className="relative group-hover:scale-110 transition-transform duration-200">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: category.color }}>
                <i className={`${category.icon} text-white text-sm`}></i>
              </div>
              <div className="absolute -top-1 -right-1">
                <TypeIcon className="w-5 h-5 p-0.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-semibold text-gray-900 dark:text-white">{bill.name}</div>
                <Badge className={`${typeInfo.color} text-xs font-medium`}>
                  {typeInfo.label}
                  {bill.billType === 'parcelada' && bill.installments && (
                    <span className="ml-1">({bill.currentInstallment}/{bill.totalInstallments})</span>
                  )}
                </Badge>
                {bill.isPaid && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 animate-pulse">
                    ✓ Pago
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{bill.description}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge 
              variant={category.name === "Casa e Utilidades" ? "default" : "secondary"}
              className="hidden sm:flex"
            >
              {category.name}
            </Badge>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-white">R$ {parseFloat(bill.amount).toFixed(2)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar size={12} /> Dia {bill.dueDay}
              </div>
            </div>
            <div className="flex items-center space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditAmount(bill)}
                className="hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
                data-testid={`edit-${bill.id}`}
              >
                <Edit size={14} />
              </Button>
              <Switch
                checked={bill.isPaid}
                onCheckedChange={(checked) => {
                  updateBillMutation.mutate({
                    id: bill.id,
                    data: { isPaid: checked }
                  });
                }}
                data-testid={`toggle-${bill.id}`}
              />
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <Card className="group relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1" data-testid={`bill-card-${bill.id}`}>
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/20 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Paid status indicator */}
        {bill.isPaid && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-green-500">
            <CheckCircle className="absolute -top-8 -right-1 w-4 h-4 text-white" />
          </div>
        )}
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border-4 border-white dark:border-gray-700" style={{ 
                  background: `linear-gradient(135deg, ${category.color}dd, ${category.color})` 
                }}>
                  <i className={`${category.icon} text-white text-2xl drop-shadow-lg`}></i>
                </div>
                <div className="absolute -bottom-2 -right-2 group-hover:scale-110 transition-transform duration-300">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-xl border-2 border-white dark:border-gray-700 shadow-lg">
                    <TypeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    {bill.name}
                  </CardTitle>
                  <Badge className={`${typeInfo.color} text-xs font-semibold px-3 py-1 rounded-full`}>
                    {typeInfo.label}
                    {bill.billType === 'parcelada' && bill.installments && (
                      <span className="ml-1 opacity-80">({bill.currentInstallment}/{bill.totalInstallments})</span>
                    )}
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {bill.description}
                </CardDescription>
              </div>
            </div>
            
            {/* Amount section with enhanced styling */}
            <div className="text-right">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-blue-700 transition-all duration-300">
                R$ {parseFloat(bill.amount).toFixed(2).replace('.', ',')}
              </div>
              {bill.installments && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    {bill.currentInstallment}/{bill.totalInstallments} parcelas
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge 
                variant={category.name === "Casa e Utilidades" ? "default" : "secondary"}
                className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-300 border-0 font-medium px-3 py-1"
              >
                {category.name}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <Calendar size={14} className="text-blue-500" />
                <span className="font-medium">Vence dia {bill.dueDay}</span>
              </div>
              {bill.isRecurring && (
                <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-400">
                  🔄 Recorrente
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action buttons with enhanced styling */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditAmount(bill)}
                className="group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 font-medium"
                data-testid={`edit-${bill.id}`}
              >
                <Edit size={14} className="mr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                Ajustar Valor
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {bill.isPaid ? 'Pago' : 'Pendente'}
              </span>
              <Switch
                checked={bill.isPaid}
                onCheckedChange={(checked) => {
                  updateBillMutation.mutate({
                    id: bill.id,
                    data: { isPaid: checked }
                  });
                }}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
                data-testid={`toggle-${bill.id}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciar Contas</h1>
              <p className="text-muted-foreground">
                Organize suas contas fixas, parceladas e avulsas em um só lugar
              </p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2" data-testid="add-bill-button">
              <Plus size={16} />
              Nova Conta
            </Button>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Pesquisar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-bills"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
                data-testid="view-cards"
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="view-list"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Todas as Contas</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {allBillsWithType.length} contas encontradas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {allBillsWithType.filter(b => b.billType === 'fixa').length} Fixas
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                  {allBillsWithType.filter(b => b.billType === 'parcelada').length} Parceladas
                </Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {allBillsWithType.filter(b => b.billType === 'avulsa').length} Avulsas
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className={viewMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
              {allBillsWithType.map((bill: any) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
              
              {allBillsWithType.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <i className="fas fa-receipt text-3xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhuma conta encontrada
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Comece criando sua primeira conta para organizar suas finanças.
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                    <Plus size={16} />
                    Adicionar Primeira Conta
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Edição de Valor */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajustar Valor da Conta</DialogTitle>
              <DialogDescription>
                Altere o valor desta conta quando houver reajustes, juros ou mudanças no valor.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Novo Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAmount} disabled={updateBillMutation.isPending}>
                {updateBillMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Modal para Adicionar Nova Conta */}
        <AddBillModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          categories={Array.isArray(categories) ? categories : []}
          userId={userId}
        />
      </div>
    </div>
  );
}