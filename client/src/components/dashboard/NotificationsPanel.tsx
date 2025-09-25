import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, BarChart3, Download, Calendar, Mail, Bell, BellOff, Settings, ExternalLink } from "lucide-react";
import type { Notification } from "@shared/schema";

interface NotificationsPanelProps {
  notifications: Notification[];
  userId: string;
  onAddBill?: () => void;
  onAddIncome?: () => void;
  onViewReports?: () => void;
  onExportData?: () => void;
}

export default function NotificationsPanel({ 
  notifications, 
  userId, 
  onAddBill,
  onAddIncome,
  onViewReports,
  onExportData 
}: NotificationsPanelProps) {
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
        return <Bell className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <Bell className="w-4 h-4 text-red-500" />;
      case 'success':
        return <Bell className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-bill':
        onAddBill?.();
        break;
      case 'add-income':
        onAddIncome?.();
        break;
      case 'view-reports':
        onViewReports?.();
        break;
      case 'export-data':
        onExportData?.();
        break;
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
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notificações</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {unreadNotifications.length > 0 
                  ? `${unreadNotifications.length} não lida(s)` 
                  : "Tudo em dia"}
              </p>
            </div>
          </div>
          {unreadNotifications.length > 0 && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs"
              data-testid="button-mark-all-read"
            >
              {markAllAsReadMutation.isPending ? "Marcando..." : "Marcar todas"}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Notifications List */}
        <div className="space-y-3 max-h-72 overflow-y-auto mb-6">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BellOff className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Nenhuma notificação</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Você estará sempre atualizado sobre suas finanças</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <div 
                key={notification.id} 
                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  notification.isRead 
                    ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800'
                } ${getNotificationBg(notification.type)}`}
                onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                data-testid={`notification-${notification.id}`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{notification.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {formatTimeAgo(notification.createdAt!)}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ações Rápidas
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleQuickAction('add-bill')}
              className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 rounded-xl transition-all duration-200 text-left border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md" 
              data-testid="button-add-bill-quick"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Adicionar Conta</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Nova conta a pagar</p>
            </button>
            
            <button 
              onClick={() => handleQuickAction('add-income')}
              className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 rounded-xl transition-all duration-200 text-left border border-green-200/50 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md" 
              data-testid="button-add-income-quick"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Registrar Receita</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Nova fonte de renda</p>
            </button>
            
            <button 
              onClick={() => handleQuickAction('view-reports')}
              className="group p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 rounded-xl transition-all duration-200 text-left border border-purple-200/50 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md" 
              data-testid="button-view-reports"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Ver Relatórios</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Análises financeiras</p>
            </button>
            
            <button 
              onClick={() => handleQuickAction('export-data')}
              className="group p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 rounded-xl transition-all duration-200 text-left border border-amber-200/50 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md" 
              data-testid="button-export-data"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Exportar Dados</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Download relatórios</p>
            </button>
          </div>

          {/* Integration Settings */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Integrações
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Google Agenda</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Sincronização ativa</p>
                  </div>
                </div>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                  Conectado
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Notificações Email</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Configuração pendente</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  data-testid="button-configure-email"
                  onClick={() => toast({
                    title: "Funcionalidade em desenvolvimento",
                    description: "A configuração de email estará disponível em breve.",
                  })}
                >
                  Configurar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}