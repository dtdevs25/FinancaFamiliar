import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { insertCategorySchema, type Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";

const categoryFormSchema = insertCategorySchema.extend({
  name: z.string().min(1, "Nome é obrigatório"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato #RRGGBB"),
  icon: z.string().min(1, "Ícone é obrigatório"),
});

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onCategoryChange?: () => void;
}

const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
];

const PRESET_ICONS = [
  { value: "fas fa-home", label: "Casa" },
  { value: "fas fa-utensils", label: "Alimentação" },
  { value: "fas fa-car", label: "Transporte" },
  { value: "fas fa-gamepad", label: "Lazer" },
  { value: "fas fa-heartbeat", label: "Saúde" },
  { value: "fas fa-graduation-cap", label: "Educação" },
  { value: "fas fa-shopping-cart", label: "Compras" },
  { value: "fas fa-mobile-alt", label: "Telefone" },
  { value: "fas fa-wifi", label: "Internet" },
  { value: "fas fa-bolt", label: "Energia" },
  { value: "fas fa-tint", label: "Água" },
  { value: "fas fa-credit-card", label: "Cartão" },
  { value: "fas fa-tags", label: "Geral" },
];

export default function CategoryManagementModal({ isOpen, onClose, userId, onCategoryChange }: CategoryManagementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: [`/api/categories/${userId}`],
    enabled: isOpen,
  });

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      color: "#3B82F6",
      icon: "fas fa-tag",
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof categoryFormSchema>) => {
      return apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      toast({
        title: "Categoria criada com sucesso",
        description: "A nova categoria foi adicionada.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${userId}`] });
      onCategoryChange?.();
      handleCancel();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof categoryFormSchema>) => {
      if (!editingCategory) throw new Error("Nenhuma categoria selecionada para edição");
      return apiRequest("PATCH", `/api/categories/${editingCategory.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Categoria atualizada com sucesso",
        description: "As alterações foram salvas.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${userId}`] });
      onCategoryChange?.();
      handleCancel();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      toast({
        title: "Categoria excluída com sucesso",
        description: "A categoria foi removida.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${userId}`] });
      onCategoryChange?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message || "Não é possível excluir categoria que está sendo usada.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof categoryFormSchema>) => {
    if (editingCategory) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsCreating(true);
    form.reset({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCategory(null);
    form.reset({
      name: "",
      color: "#3B82F6",
      icon: "fas fa-tag",
    });
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  const handleDelete = (categoryId: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-tags text-primary"></i>
            </div>
            <span>Gerenciar Categorias</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de categorias existentes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Suas Categorias</h3>
              <Button
                size="sm"
                onClick={() => setIsCreating(true)}
                disabled={isCreating}
                data-testid="button-add-category"
              >
                <i className="fas fa-plus mr-2"></i>
                Nova Categoria
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin"></i>
                <p className="text-sm text-muted-foreground mt-2">Carregando categorias...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-tags text-2xl mb-2"></i>
                <p>Nenhuma categoria encontrada</p>
                <p className="text-sm">Clique em "Nova Categoria" para começar</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map((category) => (
                  <Card key={category.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: category.color }}
                        >
                          <i className={category.icon}></i>
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{category.color}</Badge>
                            <Badge variant="outline">{category.icon}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                          disabled={isCreating}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteCategoryMutation.isPending}
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {isCreating && (
            <>
              <Separator />
              
              {/* Formulário de criação/edição */}
              <div>
                <h3 className="text-sm font-medium mb-3">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </h3>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Categoria</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Casa e Utilidades, Alimentação" 
                              {...field}
                              data-testid="input-category-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ícone</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category-icon">
                                <SelectValue placeholder="Selecione um ícone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRESET_ICONS.map((icon) => (
                                <SelectItem key={icon.value} value={icon.value}>
                                  <div className="flex items-center space-x-2">
                                    <i className={icon.value}></i>
                                    <span>{icon.label}</span>
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
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor</FormLabel>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {PRESET_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={`w-8 h-8 rounded-full border-2 ${
                                    field.value === color ? 'border-gray-800' : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => field.onChange(color)}
                                  data-testid={`color-option-${color}`}
                                />
                              ))}
                            </div>
                            <FormControl>
                              <Input 
                                placeholder="#3B82F6" 
                                {...field}
                                data-testid="input-category-color"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        data-testid="button-cancel-category"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                        data-testid="button-save-category"
                      >
                        {(createCategoryMutation.isPending || updateCategoryMutation.isPending) ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i>
                            {editingCategory ? "Atualizar" : "Criar"} Categoria
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}