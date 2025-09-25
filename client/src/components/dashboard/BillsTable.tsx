import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Bill, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Check, CreditCard, Edit, Plus } from "lucide-react";

interface BillsTableProps {
  bills: Bill[];
  categories: Category[];
  onAddBill: () => void;
}

export default function BillsTable({ bills, categories, onAddBill }: BillsTableProps) {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAsPaidMutation = useMutation({
    mutationFn: async ({ billId, paymentData }: { billId: string; paymentData: any }) => {
      return apiRequest("PATCH", `/api/bills/${billId}`, { 
        isPaid: true, 
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod
      });
    },
    onSuccess: () => {
      toast({
        title: "Conta marcada como paga",
        description: "O pagamento foi registrado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      setIsPaymentModalOpen(false);
      setSelectedBill(null);
      setPaymentDate("");
      setPaymentMethod("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao marcar conta como paga.",
        variant: "destructive",
      });
    },
  });

  const getBillStatus = (bill: Bill) => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const daysUntilDue = bill.dueDay - currentDay;

    if (bill.isPaid) {
      return { status: "Pago", className: "bg-success/10 text-success", daysText: "Pago" };
    }

    if (daysUntilDue < 0) {
      return { 
        status: "Atrasado", 
        className: "bg-destructive/10 text-destructive",
        daysText: `Vencido há ${Math.abs(daysUntilDue)} dia(s)`
      };
    }

    if (daysUntilDue === 0) {
      return { 
        status: "Vence hoje", 
        className: "bg-warning/10 text-warning",
        daysText: "Vence hoje"
      };
    }

    if (daysUntilDue <= 3) {
      return { 
        status: "Pendente", 
        className: "bg-warning/10 text-warning",
        daysText: `Em ${daysUntilDue} dia(s)`
      };
    }

    return { 
      status: "Agendado", 
      className: "bg-muted/20 text-muted-foreground",
      daysText: `Em ${daysUntilDue} dia(s)`
    };
  };

  const getCategoryIcon = (categoryId: string | null) => {
    if (!categoryId) return "fas fa-tag";
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || "fas fa-tag";
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(amount));
  };

  const formatDueDate = (dueDay: number) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    return `${dueDay.toString().padStart(2, '0')}/${currentMonth.toString().padStart(2, '0')}/${currentYear}`;
  };

  const handlePaymentClick = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentDate(new Date().toISOString().split('T')[0]); // Today's date
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = () => {
    if (selectedBill && paymentDate && paymentMethod) {
      markAsPaidMutation.mutate({
        billId: selectedBill.id,
        paymentData: { paymentDate, paymentMethod }
      });
    }
  };

  const getPaymentMethods = () => [
    { value: "checking", label: "Conta Corrente" },
    { value: "savings", label: "Poupança" },
    { value: "credit_card", label: "Cartão de Crédito" },
    { value: "debit_card", label: "Cartão de Débito" },
    { value: "pix", label: "PIX" },
    { value: "cash", label: "Dinheiro" },
    { value: "bank_slip", label: "Boleto" },
  ];

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contas a Vencer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie seus pagamentos e vencimentos</p>
              </div>
            </div>
            <Button onClick={onAddBill} className="flex items-center gap-2" data-testid="button-add-bill">
              <Plus size={16} />
              Nova Conta
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">Conta</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">Vencimento</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">Valor</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {bills.map((bill) => {
                const billStatus = getBillStatus(bill);
                return (
                  <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" data-testid={`bill-row-${bill.id}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center">
                          <i className={`${getCategoryIcon(bill.categoryId)} text-blue-600 dark:text-blue-400 text-sm`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{bill.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{bill.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDueDate(bill.dueDay)}
                          </span>
                          <span className={`block text-xs ${billStatus.status === 'Atrasado' ? 'text-red-600 dark:text-red-400' : billStatus.status === 'Pendente' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {billStatus.daysText}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-semibold text-lg text-gray-900 dark:text-white">
                        {formatCurrency(bill.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge 
                        variant={bill.isPaid ? "default" : billStatus.status === 'Atrasado' ? "destructive" : billStatus.status === 'Pendente' ? "secondary" : "outline"}
                        className="font-medium"
                      >
                        {billStatus.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {!bill.isPaid ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePaymentClick(bill)}
                            disabled={markAsPaidMutation.isPending}
                            className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                            data-testid={`button-mark-paid-${bill.id}`}
                          >
                            <Check size={14} />
                            Pagar
                          </Button>
                        ) : (
                          <Badge variant="default" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                            Pago
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                          data-testid={`button-edit-${bill.id}`}
                        >
                          <Edit size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Pagamento */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="text-green-600" size={20} />
              Registrar Pagamento
            </DialogTitle>
            <DialogDescription>
              Registre o pagamento da conta "{selectedBill?.name}" informando a data e meio de pagamento.
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
                data-testid="payment-date-input"
              />
            </div>
            
            <div>
              <Label htmlFor="payment-method">Meio de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger data-testid="payment-method-select">
                  <SelectValue placeholder="Selecione o meio de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {getPaymentMethods().map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedBill && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Resumo do Pagamento:</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedBill.name}</span>
                  <span className="font-semibold text-lg">{formatCurrency(selectedBill.amount)}</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePaymentSubmit} 
              disabled={!paymentDate || !paymentMethod || markAsPaidMutation.isPending}
              className="flex items-center gap-2"
              data-testid="confirm-payment-button"
            >
              {markAsPaidMutation.isPending ? "Registrando..." : (
                <>
                  <Check size={16} />
                  Confirmar Pagamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
