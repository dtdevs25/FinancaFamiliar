import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, setLocation] = useLocation();
  const userId = "default-user-id";

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", userId],
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: "fas fa-home",
      isActive: location === "/" || location === "/dashboard"
    },
    {
      title: "Contas",
      url: "/contas",
      icon: "fas fa-receipt",
      isActive: location === "/contas"
    },
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: "fas fa-chart-line",
      isActive: location === "/relatorios"
    },
    {
      title: "Calendário",
      url: "/calendario",
      icon: "fas fa-calendar",
      isActive: location === "/calendario"
    }
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-wallet text-white text-sm"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground">FinanFamily</h1>
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
                    <SidebarMenuButton 
                      onClick={() => setLocation(item.url)}
                      isActive={item.isActive}
                      tooltip={item.title}
                    >
                      <i className={`${item.icon} w-4 h-4`}></i>
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                {/* Notificações com badge */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setLocation("/notificacoes")}
                    isActive={location === "/notificacoes"}
                    tooltip="Notificações"
                  >
                    <i className="fas fa-bell w-4 h-4"></i>
                    <span>Notificações</span>
                    {unreadCount > 0 && (
                      <SidebarMenuBadge>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center space-x-3 p-2">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  D
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Daniel</p>
                  <p className="text-xs text-muted-foreground">daniel@email.com</p>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/api/logout" className="w-full">
                  <i className="fas fa-sign-out-alt w-4 h-4"></i>
                  <span>Sair</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <div className="h-6 w-px bg-border" />
            <h2 className="text-lg font-semibold">
              {navigationItems.find(item => item.isActive)?.title || "Dashboard"}
            </h2>
          </div>
          
          {/* Indicador de notificações no header */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/notificacoes")}
              className="relative"
            >
              <i className="fas fa-bell w-4 h-4"></i>
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </Button>
          )}
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}