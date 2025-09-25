import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertBillSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@shared/schema";
import { z } from "zod";

const addBillSchema = insertBillSchema.extend({
  amount: z.string().min(1, "Valor é obrigatório").regex(/^\d+(\.\d{2})?$/, "Formato inválido (ex: 150.00)"),
  dueDay: z.string().min(1, "Dia do vencimento é obrigatório").transform(Number),
});

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  userId: string;
}

export default function AddBillModal({ isOpen, onClose, categories, userId }: AddBillModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof addBillSchema>>({
    resolver: zodResolver(addBillSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: "",
      dueDay: "",
      categoryId: "",
      isRecurring: true,
    },
  });

  const createBillMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addBillSchema>) => {
      return apiRequest("POST", `/api/bills/${userId}`, {
        ...data,
        amount: parseFloat(data.amount).toFixed(2),
        dueDay: Number(data.dueDay),
      });
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso",
        description: "A nova conta foi adicionada ao seu orçamento.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof addBillSchema>) => {
    createBillMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-plus text-primary"></i>
            </div>
            <span>Adicionar Nova Conta</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Conta</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Energia Elétrica, Internet, Aluguel" 
                      {...field} 
                      data-testid="input-bill-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: CPFL, Vivo, Apartamento" 
                      {...field} 
                      data-testid="input-bill-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="150.00" 
                        {...field} 
                        data-testid="input-bill-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do Vencimento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="15" 
                        type="number" 
                        min="1" 
                        max="31" 
                        {...field} 
                        data-testid="input-bill-due-day"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-bill-category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <i className={category.icon} style={{ color: category.color }}></i>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <FormLabel>Conta recorrente</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Esta conta se repete todos os meses
                    </div>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      data-testid="switch-bill-recurring"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                data-testid="button-cancel-bill"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createBillMutation.isPending}
                data-testid="button-save-bill"
              >
                {createBillMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Salvar Conta
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
