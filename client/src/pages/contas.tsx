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
import { Search, Plus, Grid3X3, List, Edit, Calendar, CreditCard, Clock, CheckCircle, AlertCircle, Building, Zap, Wifi, Car, Phone, Utensils, ShoppingCart, GraduationCap, Heart, Gamepad2, Home, Wrench } from "lucide-react";
import AddBillModal from "@/components/modals/AddBillModal";

export default function ContasPage() {
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editedAmount, setEditedAmount] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUnpayConfirmModalOpen, setIsUnpayConfirmModalOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentSource, setPaymentSource] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [shouldOpenEditAfterUnpay, setShouldOpenEditAfterUnpay] = useState(false);
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
      
      if (shouldOpenEditAfterUnpay) {
        // Abrir modal de edição após desfazer pagamento
        setShouldOpenEditAfterUnpay(false);
        setEditedAmount(selectedBill?.amount || "");
        setIsEditModalOpen(true);
        toast({
          title: "Pagamento desfeito",
          description: "A conta voltou para o status pendente e você pode editá-la agora.",
        });
      } else {
        // Fechar modal de edição normalmente
        setIsEditModalOpen(false);
        toast({
          title: "Conta atualizada",
          description: "A conta foi atualizada com sucesso!",
        });
      }
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

  // Função para obter ícone específico baseado no nome da conta
  const getSpecificIcon = (billName: string) => {
    const name = billName.toLowerCase();
    
    // Moradia/Imóveis
    if (name.includes('apartamento') || name.includes('aluguel') || name.includes('condomínio')) {
      return Building;
    }
    // Energia
    if (name.includes('cpfl') || name.includes('energia') || name.includes('enel') || name.includes('light')) {
      return Zap;
    }
    // Internet/Telecomunicações
    if (name.includes('internet') || name.includes('vivo') || name.includes('claro') || name.includes('tim') || name.includes('oi')) {
      return Wifi;
    }
    // Telefone
    if (name.includes('telefone') || name.includes('celular')) {
      return Phone;
    }
    // Veículo
    if (name.includes('carro') || name.includes('moto') || name.includes('ipva') || name.includes('seguro auto')) {
      return Car;
    }
    // Alimentação
    if (name.includes('supermercado') || name.includes('alimentação') || name.includes('comida')) {
      return Utensils;
    }
    // Compras
    if (name.includes('cartão') && (name.includes('crédito') || name.includes('débito'))) {
      return CreditCard;
    }
    // Educação
    if (name.includes('escola') || name.includes('curso') || name.includes('faculdade') || name.includes('educação')) {
      return GraduationCap;
    }
    // Saúde
    if (name.includes('plano') && name.includes('saúde') || name.includes('médico') || name.includes('hospital')) {
      return Heart;
    }
    // Lazer/Entretenimento
    if (name.includes('netflix') || name.includes('spotify') || name.includes('steam') || name.includes('jogo')) {
      return Gamepad2;
    }
    // Casa/Utilidades gerais
    if (name.includes('água') || name.includes('gás') || name.includes('limpeza') || name.includes('manutenção')) {
      return Wrench;
    }
    
    // Padrão - casa
    return Home;
  };

  const handleEditAmount = (bill: any) => {
    setSelectedBill(bill);
    
    if (bill.isPaid) {
      // Se a conta está paga, mostrar modal de confirmação
      setIsUnpayConfirmModalOpen(true);
    } else {
      // Se não está paga, abrir modal de edição normalmente
      setEditedAmount(bill.amount);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveAmount = () => {
    if (selectedBill && editedAmount) {
      updateBillMutation.mutate({
        id: selectedBill.id,
        data: { amount: editedAmount }
      });
    }
  };

  const handleTogglePayment = (checked: boolean, bill: any) => {
    if (checked) {
      // Se está marcando como pago, abrir modal para capturar detalhes
      setSelectedBill(bill);
      setPaymentDate(new Date().toISOString().split('T')[0]); // Data de hoje
      setIsPaymentModalOpen(true);
    } else {
      // Se está desmarcando como pago, mostrar confirmação primeiro
      setSelectedBill(bill);
      setIsUnpayConfirmModalOpen(true);
    }
  };

  const handleUnpayConfirm = () => {
    if (selectedBill) {
      // Definir flag para abrir modal de edição após o sucesso da mutation
      setShouldOpenEditAfterUnpay(true);
      
      updateBillMutation.mutate({
        id: selectedBill.id,
        data: { 
          isPaid: false,
          paymentDate: null,
          paymentMethod: null,
          paymentSource: null
        }
      });
      
      setIsUnpayConfirmModalOpen(false);
    }
  };

  const handleSavePayment = () => {
    if (selectedBill && paymentDate && paymentMethod) {
      updateBillMutation.mutate({
        id: selectedBill.id,
        data: { 
          isPaid: true,
          paymentDate,
          paymentMethod,
          paymentSource: paymentSource || undefined
        }
      });
      
      // Limpar modal
      setIsPaymentModalOpen(false);
      setSelectedBill(null);
      setPaymentDate("");
      setPaymentMethod("");
      setPaymentSource("");
    }
  };

  const BillCard = ({ bill }: { bill: any }) => {
    const category = getCategoryInfo(bill.categoryId);
    const typeInfo = getBillTypeInfo(bill.billType);
    const TypeIcon = typeInfo.icon;
    
    if (viewMode === "list") {
      return (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200" data-testid={`bill-${bill.id}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color }}>
              {(() => {
                const SpecificIcon = getSpecificIcon(bill.name);
                return <SpecificIcon className="w-5 h-5 text-white" />;
              })()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">{bill.name}</span>
                <Badge className={`${typeInfo.color} text-xs`}>
                  {typeInfo.label}
                </Badge>
                {bill.isPaid && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    ✓ Pago
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{bill.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-semibold text-gray-900 dark:text-white">R$ {parseFloat(bill.amount).toFixed(2)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar size={10} /> Dia {bill.dueDay}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditAmount(bill)}
                data-testid={`edit-${bill.id}`}
              >
                <Edit size={12} />
              </Button>
              <Switch
                checked={bill.isPaid}
                onCheckedChange={(checked) => handleTogglePayment(checked, bill)}
                data-testid={`toggle-${bill.id}`}
              />
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        bill.isPaid 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800' 
          : 'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-850 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
      }`} data-testid={`bill-card-${bill.id}`}>
        
        {/* Status ribbon */}
        {bill.isPaid && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-green-500">
            <CheckCircle className="absolute -top-8 -right-1 w-4 h-4 text-white drop-shadow-sm" />
          </div>
        )}
        
        <CardHeader className="pb-4">
          {/* Header with gradient background */}
          <div className={`absolute inset-x-0 top-0 h-20 opacity-60 ${
            bill.isPaid 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
          }`}></div>
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Enhanced icon with shadow and glow effect */}
              <div className="relative group-hover:scale-105 transition-transform duration-200">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                    boxShadow: `0 4px 12px ${category.color}40`
                  }}
                >
                  {(() => {
                    const SpecificIcon = getSpecificIcon(bill.name);
                    return <SpecificIcon className="w-8 h-8 text-white drop-shadow-sm" />;
                  })()}
                </div>
                
                {/* Type badge */}
                <div className="absolute -bottom-2 -right-2 group-hover:scale-110 transition-transform duration-200">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-white dark:border-gray-700">
                    <TypeIcon className={`w-4 h-4 ${
                      bill.billType === 'fixa' ? 'text-blue-600' :
                      bill.billType === 'parcelada' ? 'text-purple-600' : 'text-green-600'
                    }`} />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 pt-1">
                <CardTitle className={`text-xl font-bold mb-1 transition-colors ${
                  bill.isPaid 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300'
                }`}>
                  {bill.name}
                </CardTitle>
                <CardDescription className={`text-sm leading-relaxed ${
                  bill.isPaid 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {bill.description}
                </CardDescription>
              </div>
            </div>
            
            {/* Enhanced amount display */}
            <div className="text-right">
              <div className={`text-2xl font-extrabold mb-1 ${
                bill.isPaid
                  ? 'text-green-700 dark:text-green-300'
                  : 'bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent'
              }`}>
                R$ {parseFloat(bill.amount).toFixed(2).replace('.', ',')}
              </div>
              {bill.installments && (
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1 justify-end">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                  {bill.currentInstallment}/{bill.totalInstallments} parcelas
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Enhanced badges */}
              <Badge className={`${typeInfo.color} font-semibold px-3 py-1 shadow-sm`}>
                {typeInfo.label}
                {bill.billType === 'parcelada' && bill.installments && (
                  <span className="ml-1 opacity-80">({bill.currentInstallment}/{bill.totalInstallments})</span>
                )}
              </Badge>
              
              <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border font-medium px-3 py-1">
                {category.name}
              </Badge>
              
              <div className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ${
                bill.isPaid 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}>
                <Calendar size={12} />
                <span>Vence dia {bill.dueDay}</span>
              </div>
              
              {bill.isRecurring && (
                <Badge variant="outline" className="border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30">
                  🔄 Recorrente
                </Badge>
              )}
            </div>
          </div>
          
          {/* Enhanced action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100/60 dark:border-gray-700/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditAmount(bill)}
              className={`group-hover:shadow-md transition-all duration-200 font-medium ${
                bill.isPaid
                  ? 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              data-testid={`edit-${bill.id}`}
            >
              <Edit size={14} className="mr-2" />
              Ajustar Valor
            </Button>
            
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold ${
                bill.isPaid 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {bill.isPaid ? '✓ Pago' : 'Pendente'}
              </span>
              <Switch
                checked={bill.isPaid}
                onCheckedChange={(checked) => handleTogglePayment(checked, bill)}
                className={`${
                  bill.isPaid 
                    ? 'data-[state=checked]:bg-green-500' 
                    : 'data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600'
                } transition-colors duration-200`}
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
          
          <div className="p-4">
            <div className={viewMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-2"}>
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
        
        {/* Modal de Detalhes de Pagamento */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
              <DialogDescription>
                Informe os detalhes do pagamento de <strong>{selectedBill?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-date">Data do Pagamento</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  data-testid="input-payment-date"
                />
              </div>
              
              <div>
                <Label htmlFor="payment-method">Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="debit">Cartão de Débito</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="bank_slip">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="payment-source">Origem do Pagamento (opcional)</Label>
                <Input
                  id="payment-source"
                  placeholder="Ex: Cartão de Crédito Dani, Conta Corrente João, etc."
                  value={paymentSource}
                  onChange={(e) => setPaymentSource(e.target.value)}
                  data-testid="input-payment-source"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setSelectedBill(null);
                  setPaymentDate("");
                  setPaymentMethod("");
                  setPaymentSource("");
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePayment} 
                disabled={!paymentDate || !paymentMethod || updateBillMutation.isPending}
                data-testid="button-save-payment"
              >
                {updateBillMutation.isPending ? "Salvando..." : "Registrar Pagamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Modal de Confirmação para Desfazer Pagamento */}
        <Dialog open={isUnpayConfirmModalOpen} onOpenChange={setIsUnpayConfirmModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="text-amber-600" size={20} />
                Conta já está paga
              </DialogTitle>
              <DialogDescription>
                A conta "{selectedBill?.name}" está marcada como paga. Para editá-la, é necessário desfazer o pagamento primeiro.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="text-amber-600 dark:text-amber-400" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Atenção
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Ao confirmar, o pagamento será desfeito e a conta voltará para o status pendente. Você poderá então editá-la normalmente.
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedBill && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Informações da Conta:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Nome:</span>
                      <span className="font-medium">{selectedBill.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Valor:</span>
                      <span className="font-medium">R$ {parseFloat(selectedBill.amount).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status:</span>
                      <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        ✓ Pago
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUnpayConfirmModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUnpayConfirm} 
                disabled={updateBillMutation.isPending}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="confirm-unpay-button"
              >
                {updateBillMutation.isPending ? "Processando..." : (
                  <>
                    <AlertCircle size={16} />
                    Desfazer Pagamento
                  </>
                )}
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