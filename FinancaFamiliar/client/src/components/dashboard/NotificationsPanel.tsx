import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";

interface NotificationsPanelProps {
  notifications: Notification[];
  userId: string;
}

export default function NotificationsPanel({ notifications, userId }: NotificationsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/notifications/${userId}/read-all`, {});
    },
    onSuccess: () => {
      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram atualizadas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao marcar notificações como lidas.",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return 'fas fa-exclamation-triangle text-warning';
      case 'error':
        return 'fas fa-times-circle text-destructive';
      case 'success':
        return 'fas fa-check-circle text-success';
      default:
        return 'fas fa-bell text-secondary';
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/5 border-warning/20';
      case 'error':
        return 'bg-destructive/5 border-destructive/20';
      case 'success':
        return 'bg-success/5 border-success/20';
      default:
        return 'bg-secondary/5 border-secondary/20';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} dia(s) atrás`;
    } else if (hours > 0) {
      return `${hours} hora(s) atrás`;
    } else if (minutes > 0) {
      return `${minutes} minuto(s) atrás`;
    } else {
      return 'Agora';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Notificações</h3>
        {unreadNotifications.length > 0 && (
          <button 
            className="text-primary hover:text-primary/80 text-sm font-medium"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            data-testid="button-mark-all-read"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-bell-slash text-4xl text-muted-foreground mb-2"></i>
            <p className="text-muted-foreground">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-opacity ${
                notification.isRead ? 'opacity-60' : ''
              } ${getNotificationBg(notification.type)}`}
              onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
              data-testid={`notification-${notification.id}`}
            >
              <div className="w-8 h-8 bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                <i className={`${getNotificationIcon(notification.type)} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimeAgo(notification.createdAt!)}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-medium text-foreground mb-3">Ações Rápidas</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left" data-testid="button-add-bill-quick">
            <i className="fas fa-plus text-primary mb-2"></i>
            <p className="text-sm font-medium text-foreground">Adicionar Conta</p>
          </button>
          
          <button className="p-4 bg-success/10 hover:bg-success/20 rounded-lg transition-colors text-left" data-testid="button-add-income-quick">
            <i className="fas fa-arrow-up text-success mb-2"></i>
            <p className="text-sm font-medium text-foreground">Registrar Receita</p>
          </button>
          
          <button className="p-4 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors text-left" data-testid="button-view-reports">
            <i className="fas fa-chart-bar text-secondary mb-2"></i>
            <p className="text-sm font-medium text-foreground">Ver Relatórios</p>
          </button>
          
          <button className="p-4 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-left" data-testid="button-export-data">
            <i className="fas fa-download text-accent mb-2"></i>
            <p className="text-sm font-medium text-foreground">Exportar Dados</p>
          </button>
        </div>

        {/* Integration Settings */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-medium text-foreground mb-3">Integrações</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="fas fa-calendar-alt text-muted-foreground"></i>
                <span className="text-sm">Google Agenda</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-success">Conectado</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="fas fa-envelope text-muted-foreground"></i>
                <span className="text-sm">Email Notifications</span>
              </div>
              <button className="text-xs text-primary hover:text-primary/80" data-testid="button-configure-email">
                Configurar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
