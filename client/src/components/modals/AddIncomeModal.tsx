import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertIncomeSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { z } from "zod";

const addIncomeSchema = insertIncomeSchema.extend({
  amount: z.string().min(1, "Valor é obrigatório").regex(/^\d+(\.\d{2})?$/, "Formato inválido (ex: 2500.00)"),
  receiptDay: z.string().optional(),
  date: z.date().optional().nullable(),
  customSource: z.string().optional(),
}).refine((data) => {
  if (data.source === "Custom" && !data.customSource?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Nome da fonte personalizada é obrigatório",
  path: ["customSource"],
});

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function AddIncomeModal({ isOpen, onClose, userId }: AddIncomeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>();

  const form = useForm<z.infer<typeof addIncomeSchema>>({
    resolver: zodResolver(addIncomeSchema),
    defaultValues: {
      source: "Daniel",
      description: "",
      amount: "",
      receiptDay: "",
      isRecurring: true,
      date: null,
      customSource: "",
    },
  });

  const isRecurring = form.watch("isRecurring");
  const source = form.watch("source");
  const customSource = form.watch("customSource");

  const createIncomeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addIncomeSchema>) => {
      const finalSource = data.source === "Custom" ? data.customSource : data.source;
      const payload = {
        ...data,
        source: finalSource,
        amount: parseFloat(data.amount).toFixed(2),
        receiptDay: data.receiptDay ? Number(data.receiptDay) : null,
        date: data.date ? format(data.date, "yyyy-MM-dd") : null,
      };
      // Remove customSource from payload since it's not part of the schema
      delete payload.customSource;
      return apiRequest("POST", `/api/incomes/${userId}`, payload);
    },
    onSuccess: () => {
      toast({
        title: "Receita criada com sucesso",
        description: "A nova receita foi adicionada ao seu orçamento.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      form.reset();
      setSelectedDate(undefined);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar receita",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof addIncomeSchema>) => {
    createIncomeMutation.mutate({
      ...data,
      date: selectedDate || null,
    });
  };

  const handleClose = () => {
    form.reset();
    setSelectedDate(undefined);
    onClose();
  };

  const getDefaultDescription = (source: string, isRecurring: boolean) => {
    if (source === "Daniel") {
      return isRecurring ? "Salário" : "Receita extra";
    }
    if (source === "Maria") {
      return isRecurring ? "Salário" : "Receita extra";
    }
    if (source === "Custom") {
      return isRecurring ? "Receita mensal" : "Receita única";
    }
    return "PLR, Férias ou outras receitas";
  };

  const getDefaultReceiptDay = (source: string) => {
    if (source === "Daniel") return "30";
    if (source === "Maria") return "5";
    return "";
  };

  // Update description and receipt day when source changes
  const handleSourceChange = (newSource: string) => {
    form.setValue("source", newSource);
    form.setValue("description", getDefaultDescription(newSource, isRecurring || false));
    if (isRecurring) {
      form.setValue("receiptDay", getDefaultReceiptDay(newSource));
    }
  };

  // Update description when recurring changes
  const handleRecurringChange = (isRecurring: boolean) => {
    form.setValue("isRecurring", isRecurring);
    form.setValue("description", getDefaultDescription(source, isRecurring));
    if (!isRecurring) {
      form.setValue("receiptDay", "");
    } else {
      form.setValue("receiptDay", getDefaultReceiptDay(source));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <i className="fas fa-plus text-success"></i>
            </div>
            <span>Adicionar Nova Receita</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fonte da Receita</FormLabel>
                  <Select onValueChange={handleSourceChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-income-source">
                        <SelectValue placeholder="Selecione a fonte" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Daniel">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-medium">D</div>
                          <span>Daniel</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Maria">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">M</div>
                          <span>Maria</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Extra">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-star text-accent"></i>
                          <span>Receita Extra</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Custom">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-plus text-green-600"></i>
                          <span>Nova Fonte de Receita</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {source === "Custom" && (
              <FormField
                control={form.control}
                name="customSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Nova Fonte de Receita</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Freelance, Aluguel, Investimentos" 
                        {...field} 
                        data-testid="input-custom-source"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Salário, PLR, Férias" 
                      {...field} 
                      data-testid="input-income-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="2500.00" 
                      {...field} 
                      data-testid="input-income-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Receita recorrente</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Esta receita se repete todos os meses
                    </div>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value || false} 
                      onCheckedChange={handleRecurringChange}
                      data-testid="switch-income-recurring"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isRecurring ? (
              <FormField
                control={form.control}
                name="receiptDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do Recebimento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="5" 
                        type="number" 
                        min="1" 
                        max="31" 
                        {...field} 
                        data-testid="input-income-receipt-day"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-2">
                <FormLabel>Data do Recebimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                      data-testid="button-income-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                data-testid="button-cancel-income"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createIncomeMutation.isPending}
                data-testid="button-save-income"
              >
                {createIncomeMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Salvar Receita
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
