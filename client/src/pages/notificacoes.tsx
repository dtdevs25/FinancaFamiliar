import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function NotificacoesPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const userId = "default-user-id";

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications", userId],
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erro ao marcar notificação como lida");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] });
      toast({
        title: "Notificação marcada como lida",
        description: "A notificação foi atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar a notificação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/notifications/${userId}/mark-all-read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erro ao marcar todas as notificações como lidas");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] });
      toast({
        title: "Todas as notificações marcadas como lidas",
        description: "Suas notificações foram atualizadas!",
      });
    },
  });

  const filteredNotifications = notifications.filter((notification: any) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning": return "fas fa-exclamation-triangle text-yellow-500";
      case "error": return "fas fa-times-circle text-red-500";
      case "success": return "fas fa-check-circle text-green-500";
      case "info": return "fas fa-info-circle text-blue-500";
      default: return "fas fa-bell text-gray-500";
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case "warning": return "border-l-yellow-500";
      case "error": return "border-l-red-500";
      case "success": return "border-l-green-500";
      case "info": return "border-l-blue-500";
      default: return "border-l-gray-500";
    }
  };

  const NotificationCard = ({ notification }: { notification: any }) => (
    <Card className={`${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-background'} border-l-4 ${getNotificationBorderColor(notification.type)} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-base font-semibold">
                  {notification.title}
                </CardTitle>
                {!notification.isRead && (
                  <Badge variant="destructive" className="text-xs">Nova</Badge>
                )}
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {notification.message}
              </CardDescription>
              <div className="text-xs text-muted-foreground mt-2">
                {new Date(notification.createdAt).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
          
          {!notification.isRead && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAsReadMutation.mutate(notification.id)}
              disabled={markAsReadMutation.isPending}
            >
              Marcar como lida
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Notificações</h1>
              <p className="text-muted-foreground">
                Acompanhe alertas importantes sobre suas finanças
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
              </Badge>
              
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Não lidas ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Lidas ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification: any) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center text-muted-foreground">
                      <i className="fas fa-bell-slash text-4xl mb-4"></i>
                      <h3 className="text-lg font-medium mb-2">
                        {filter === "unread" 
                          ? "Nenhuma notificação não lida" 
                          : filter === "read" 
                          ? "Nenhuma notificação lida"
                          : "Nenhuma notificação encontrada"
                        }
                      </h3>
                      <p className="text-sm">
                        {filter === "all" 
                          ? "Você está em dia! Não há notificações no momento."
                          : filter === "unread"
                          ? "Todas as suas notificações foram lidas."
                          : "Você ainda não leu nenhuma notificação."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Estatísticas de notificações */}
        {notifications.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.length}
                </div>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avisos</CardTitle>
                <div className="text-2xl font-bold text-yellow-600">
                  {notifications.filter((n: any) => n.type === 'warning').length}
                </div>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sucessos</CardTitle>
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter((n: any) => n.type === 'success').length}
                </div>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Críticos</CardTitle>
                <div className="text-2xl font-bold text-red-600">
                  {notifications.filter((n: any) => n.type === 'error').length}
                </div>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}