import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Bill, Category } from "@shared/schema";

interface BillsTableProps {
  bills: Bill[];
  categories: Category[];
  onAddBill: () => void;
}

export default function BillsTable({ bills, categories, onAddBill }: BillsTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAsPaidMutation = useMutation({
    mutationFn: async (billId: string) => {
      return apiRequest("PATCH", `/api/bills/${billId}`, { isPaid: true });
    },
    onSuccess: () => {
      toast({
        title: "Conta marcada como paga",
        description: "A conta foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
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

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Contas a Vencer</h3>
        <button 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          onClick={onAddBill}
          data-testid="button-add-bill"
        >
          <i className="fas fa-plus mr-2"></i>Nova Conta
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 text-sm font-medium text-muted-foreground">Conta</th>
              <th className="text-left py-3 text-sm font-medium text-muted-foreground">Vencimento</th>
              <th className="text-right py-3 text-sm font-medium text-muted-foreground">Valor</th>
              <th className="text-center py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-center py-3 text-sm font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bills.map((bill) => {
              const billStatus = getBillStatus(bill);
              return (
                <tr key={bill.id} data-testid={`bill-row-${bill.id}`}>
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <i className={`${getCategoryIcon(bill.categoryId)} text-primary`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{bill.name}</p>
                        <p className="text-sm text-muted-foreground">{bill.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-foreground">
                      {formatDueDate(bill.dueDay)}
                    </span>
                    <span className={`block text-xs ${billStatus.status === 'Atrasado' ? 'text-destructive' : billStatus.status === 'Pendente' ? 'text-warning' : 'text-muted-foreground'}`}>
                      {billStatus.daysText}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(bill.amount)}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${billStatus.className}`}>
                      {billStatus.status}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {!bill.isPaid && (
                        <button 
                          className="text-success hover:text-success/80"
                          onClick={() => markAsPaidMutation.mutate(bill.id)}
                          disabled={markAsPaidMutation.isPending}
                          title="Marcar como pago"
                          data-testid={`button-mark-paid-${bill.id}`}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                      <button 
                        className="text-muted-foreground hover:text-foreground"
                        title="Editar"
                        data-testid={`button-edit-${bill.id}`}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
