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

export default function ContasPage() {
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedAmount, setEditedAmount] = useState("");
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

  // Separar contas por tipo
  const contasFixas = bills.filter((bill: any) => bill.isRecurring && !bill.installments);
  const contasParceladas = bills.filter((bill: any) => bill.installments);
  const contasAvulsas = bills.filter((bill: any) => !bill.isRecurring && !bill.installments);

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat: any) => cat.id === categoryId) || { name: "Outros", color: "#6B7280", icon: "fas fa-tag" };
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
    
    return (
      <Card className="hover:shadow-md transition-shadow">
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
              <span className="text-sm text-muted-foreground">
                Vence dia {bill.dueDay}
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
              >
                <i className="fas fa-edit mr-2"></i>
                Ajustar Valor
              </Button>
              
              <Switch
                checked={bill.isPaid}
                onCheckedChange={(checked) => {
                  updateBillMutation.mutate({
                    id: bill.id,
                    data: { isPaid: checked }
                  });
                }}
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciar Contas</h1>
          <p className="text-muted-foreground">
            Organize suas contas fixas, parceladas e avulsas em um só lugar
          </p>
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
                <div className="space-y-4">
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
                <div className="space-y-4">
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
                <div className="space-y-4">
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
      </div>
    </div>
  );
}