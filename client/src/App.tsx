import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/dashboard";
import ContasPage from "@/pages/contas";
import RelatoriosPage from "@/pages/relatorios";
import CalendarioPage from "@/pages/calendario";
import NotificacoesPage from "@/pages/notificacoes";
import PerfilPage from "@/pages/perfil";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/contas" component={ContasPage} />
        <Route path="/relatorios" component={RelatoriosPage} />
        <Route path="/calendario" component={CalendarioPage} />
        <Route path="/notificacoes" component={NotificacoesPage} />
        <Route path="/perfil" component={PerfilPage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
