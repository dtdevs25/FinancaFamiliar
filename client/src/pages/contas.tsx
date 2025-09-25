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
import { Search, Plus, Grid3X3, List, Edit, Calendar } from "lucide-react";
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

  // Separar contas por tipo
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

  const BillCard = ({ bill, showInstallmentInfo = false }: { bill: any; showInstallmentInfo?: boolean }) => {
    const category = getCategoryInfo(bill.categoryId);
    
    if (viewMode === "list") {
      return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors" data-testid={`bill-${bill.id}`}>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color }}>
              <i className={`${category.icon} text-white text-xs`}></i>
            </div>
            <div>
              <div className="font-semibold">{bill.name}</div>
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color }}>
                <i className={`${category.icon} text-white text-sm`}></i>
              </div>
              <div>
                <CardTitle className="text-lg">{bill.name}</CardTitle>
                <CardDescription>{bill.description}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                R$ {parseFloat(bill.amount).toFixed(2)}
              </div>
              {showInstallmentInfo && bill.installments && (
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

        <Tabs defaultValue="fixas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fixas">
              Contas Fixas ({contasFixas.length})
            </TabsTrigger>
            <TabsTrigger value="parceladas">
              Parceladas ({contasParceladas.length})
            </TabsTrigger>
            <TabsTrigger value="avulsas">
              Avulsas ({contasAvulsas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fixas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contas Fixas Mensais</CardTitle>
                <CardDescription>
                  Contas que se repetem todos os meses. Você pode ajustar o valor quando houver reajustes ou juros.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={viewMode === "cards" ? "space-y-4" : "space-y-2"}>
                  {contasFixas.map((bill: any) => (
                    <BillCard key={bill.id} bill={bill} />
                  ))}
                  
                  {contasFixas.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-receipt text-4xl mb-4"></i>
                      <p>Nenhuma conta fixa cadastrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parceladas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contas Parceladas</CardTitle>
                <CardDescription>
                  Compras e contas divididas em parcelas. O sistema calcula automaticamente o valor total e parcelas restantes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={viewMode === "cards" ? "space-y-4" : "space-y-2"}>
                  {contasParceladas.map((bill: any) => (
                    <BillCard key={bill.id} bill={bill} showInstallmentInfo />
                  ))}
                  
                  {contasParceladas.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-credit-card text-4xl mb-4"></i>
                      <p>Nenhuma conta parcelada cadastrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avulsas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contas Avulsas</CardTitle>
                <CardDescription>
                  Contas esporádicas e gastos únicos que não se repetem mensalmente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={viewMode === "cards" ? "space-y-4" : "space-y-2"}>
                  {contasAvulsas.map((bill: any) => (
                    <BillCard key={bill.id} bill={bill} />
                  ))}
                  
                  {contasAvulsas.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-file-invoice text-4xl mb-4"></i>
                      <p>Nenhuma conta avulsa cadastrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
          categories={categories}
          userId={userId}
        />
      </div>
    </div>
  );
}