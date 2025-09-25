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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          onClick={() => setLocation(item.url)}
                          isActive={item.isActive}
                          className="group hover:bg-accent transition-colors"
                        >
                          <i className={`${item.icon} w-4 h-4`}></i>
                          <span className="group-data-[collapsible=icon]:sr-only">{item.title}</span>
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
                        className="group hover:bg-accent transition-colors"
                      >
                        <i className="fas fa-bell w-4 h-4"></i>
                        <span className="group-data-[collapsible=icon]:sr-only">Notificações</span>
                        {unreadCount > 0 && (
                          <SidebarMenuBadge className="group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-2 group-data-[collapsible=icon]:right-2">
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
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-4 bg-background/95 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <div className="h-6 w-px bg-border" />
            <h2 className="text-lg font-semibold">
              {navigationItems.find(item => item.isActive)?.title || "Dashboard"}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sino de notificações sempre visível */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/notificacoes")}
                  className="relative h-9 w-9 rounded-full hover:bg-accent"
                >
                  <i className="fas fa-bell w-4 h-4"></i>
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{unreadCount > 0 ? `${unreadCount} notificações` : "Notificações"}</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Avatar do usuário */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      D
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium leading-none">Daniel</p>
                    <p className="text-xs text-muted-foreground">Administrador</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Perfil do usuário</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}