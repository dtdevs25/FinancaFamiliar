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
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors" data-testid={`bill-${bill.id}`}>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color }}>
              <i className={`${category.icon} text-white text-xs`}></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-semibold">{bill.name}</div>
                <Badge className={`${typeInfo.color} text-xs font-medium`}>
                  {typeInfo.label}
                  {bill.billType === 'parcelada' && bill.installments && (
                    <span className="ml-1">({bill.currentInstallment}/{bill.totalInstallments})</span>
                  )}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{bill.description}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant={category.name === "Casa e Utilidades" ? "default" : "secondary"}>
              {category.name}
            </Badge>
            <div className="text-right">
              <div className="font-bold">R$ {parseFloat(bill.amount).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar size={12} /> Dia {bill.dueDay}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditAmount(bill)}
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
      <Card className="hover:shadow-md transition-shadow" data-testid={`bill-card-${bill.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: category.color }}>
                  <i className={`${category.icon} text-white text-lg`}></i>
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <TypeIcon className="w-6 h-6 p-1 bg-white dark:bg-gray-900 rounded-full border-2 border-white dark:border-gray-900 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold">{bill.name}</CardTitle>
                  <Badge className={`${typeInfo.color} text-xs font-medium`}>
                    {typeInfo.label}
                    {bill.billType === 'parcelada' && bill.installments && (
                      <span className="ml-1">({bill.currentInstallment}/{bill.totalInstallments})</span>
                    )}
                  </Badge>
                  {bill.isPaid && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Pago
                    </Badge>
                  )}
                </div>
                <CardDescription>{bill.description}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                R$ {parseFloat(bill.amount).toFixed(2)}
              </div>
              {bill.installments && (
                <div className="text-sm text-muted-foreground">
                  {bill.currentInstallment}/{bill.totalInstallments} parcelas
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant={category.name === "Casa e Utilidades" ? "default" : "secondary"}>
                {category.name}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar size={12} /> Vence dia {bill.dueDay}
              </span>
              {bill.isRecurring && (
                <Badge variant="outline">Fixa</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditAmount(bill)}
                data-testid={`edit-${bill.id}`}
              >
                <Edit size={14} className="mr-2" />
                Ajustar
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