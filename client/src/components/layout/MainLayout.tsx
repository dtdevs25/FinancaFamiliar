import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  CalendarDays,
  BellRing,
  ChevronDown,
  UserPen,
  Settings,
  LogOut,
  DollarSign,
  Users,
  Eye,
  ScrollText
} from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, setLocation] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userId = "default-user-id";

  const markNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] });
    },
  });

  const markAllNotificationsAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', `/api/notifications/${userId}/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] });
    },
  });

  const markNotificationAsRead = (notificationId: string) => {
    markNotificationMutation.mutate(notificationId);
  };

  const markAllNotificationsAsRead = () => {
    markAllNotificationsAsReadMutation.mutate();
  };

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", userId],
    refetchInterval: 30000,
  });

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: location === "/" || location === "/dashboard"
    },
    {
      title: "Contas",
      url: "/contas",
      icon: FileText,
      isActive: location === "/contas"
    },
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: TrendingUp,
      isActive: location === "/relatorios"
    },
    {
      title: "Calendário",
      url: "/calendario",
      icon: CalendarDays,
      isActive: location === "/calendario"
    },
    {
      title: "Logs",
      url: "/logs",
      icon: ScrollText,
      isActive: location === "/logs"
    }
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="group-data-[collapsible=icon]:px-2">
          <div className="flex items-center space-x-2 px-2 group-data-[collapsible=icon]:space-x-0 group-data-[collapsible=icon]:justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <DollarSign className="text-white" size={20} />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-1">
                <DollarSign className="text-primary" size={16} />
                <h1 className="text-lg font-semibold text-foreground">SantosFinance</h1>
              </div>
              <p className="text-xs text-muted-foreground">Gestão Financeira</p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          onClick={() => setLocation(item.url)}
                          isActive={item.isActive}
                          className="group hover:bg-accent transition-colors data-[collapsible=icon]:justify-center"
                          data-testid={`nav-${item.title.toLowerCase()}`}
                        >
                          <item.icon size={16} className="shrink-0" />
                          <span className="group-data-[collapsible=icon]:sr-only transition-opacity">{item.title}</span>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="group-data-[collapsible=icon]:block hidden">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
                
                {/* Notificações com badge */}
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        onClick={() => setLocation("/notificacoes")}
                        isActive={location === "/notificacoes"}
                        className="group hover:bg-accent transition-colors data-[collapsible=icon]:justify-center relative"
                        data-testid="nav-notifications"
                      >
                        <BellRing size={16} className="shrink-0" />
                        <span className="group-data-[collapsible=icon]:sr-only transition-opacity">Notificações</span>
                        {unreadCount > 0 && (
                          <SidebarMenuBadge className="group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:-top-1 group-data-[collapsible=icon]:-right-1 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4 group-data-[collapsible=icon]:text-xs">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="group-data-[collapsible=icon]:block hidden">
                      <p>Notificações {unreadCount > 0 ? `(${unreadCount})` : ""}</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {/* Footer vazio - dados do usuário movidos para o header */}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <h2 className="text-lg font-semibold">
              {navigationItems.find(item => item.isActive)?.title || "Dashboard"}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sino de notificações com dropdown */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-9 w-9 rounded-full hover:bg-accent"
                  data-testid="notifications-button"
                >
                  <BellRing size={16} />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between">
                    <span>Notificações</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <>
                          <Badge variant="secondary" className="text-xs">
                            {unreadCount} não lidas
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={markAllNotificationsAsRead}
                            disabled={markAllNotificationsAsReadMutation.isPending}
                            data-testid="mark-all-read"
                          >
                            Marcar todas
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification: any) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="cursor-pointer p-3 flex flex-col items-start space-y-1"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium">{notification.title}</span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <BellRing className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                )}
                {Array.isArray(notifications) && notifications.length > 5 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/notificacoes")}>
                      <Eye size={16} className="mr-2" />
                      Ver todas as notificações
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Avatar do usuário com dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors" data-testid="user-avatar">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      D
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium leading-none">Daniel</p>
                    <p className="text-xs text-muted-foreground">Administrador</p>
                  </div>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/perfil")} data-testid="edit-profile">
                  <UserPen size={16} className="mr-2" />
                  Editar Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/configuracoes")} className="opacity-50 cursor-not-allowed">
                  <Settings size={16} className="mr-2" />
                  Configurações (em breve)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-red-600 focus:text-red-600"
                  data-testid="logout-button"
                >
                  <LogOut size={16} className="mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}