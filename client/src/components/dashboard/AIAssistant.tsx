import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AIAssistantProps {
  userId: string;
}

interface AIAdvice {
  suggestion: string;
  potentialSavings: number;
  priority: "high" | "medium" | "low";
  category: string;
  actionItems: string[];
}

export default function AIAssistant({ userId }: AIAssistantProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: aiAdvice, isLoading } = useQuery({
    queryKey: ["/api/ai-advice", userId],
    enabled: isModalOpen,
  });

  const { data: quickTip } = useQuery({
    queryKey: ["/api/ai-analysis", userId],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive bg-destructive/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-success bg-success/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  return (
    <>
      {/* AI Assistant Card */}
      <div className="mt-4 lg:mt-0 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-4 lg:w-80">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-robot text-accent-foreground"></i>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">💡 Dica da IA</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {quickTip?.analysis || "Analisando seus gastos para oferecer dicas personalizadas..."}
            </p>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <button 
                  className="text-accent hover:text-accent/80 text-xs font-medium mt-2"
                  data-testid="button-ai-details"
                >
                  Ver detalhes
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <i className="fas fa-robot text-accent"></i>
                    <span>Assistente IA - Dicas de Economia</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2 mb-3" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : aiAdvice && aiAdvice.length > 0 ? (
                    aiAdvice.map((advice: AIAdvice, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3" data-testid={`ai-advice-${index}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{advice.suggestion}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Categoria: {advice.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(advice.priority)}`}>
                              {advice.priority === 'high' ? 'Alta' : advice.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                            <p className="text-sm font-semibold text-success mt-1">
                              Economia: {formatCurrency(advice.potentialSavings)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Ações recomendadas:</h4>
                          <ul className="space-y-1">
                            {advice.actionItems.map((action, actionIndex) => (
                              <li key={actionIndex} className="text-sm text-muted-foreground flex items-start space-x-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-lightbulb text-4xl text-muted-foreground mb-4"></i>
                      <h3 className="font-semibold text-foreground mb-2">Dicas em preparação</h3>
                      <p className="text-muted-foreground">
                        Estamos analisando seus dados financeiros para oferecer dicas personalizadas.
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <div className="bg-muted/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <i className="fas fa-info-circle text-primary"></i>
                        <span className="font-medium text-foreground">Como funciona</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nossa IA analisa seus padrões de gastos e receitas para identificar oportunidades de economia 
                        personalizadas para sua situação financeira familiar.
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}
