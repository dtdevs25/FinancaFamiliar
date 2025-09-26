import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  User,
  Database,
  X,
  ScrollText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  message: string;
  metadata: string | null;
  createdAt: string;
};

const actionColors = {
  create: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  update: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400", 
  delete: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400",
  payment: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400",
} as const;

const entityTypeColors = {
  bill: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
  income: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  category: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400",
  goal: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
} as const;

export default function LogsPage() {
  const [searchText, setSearchText] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(50);
  
  const userId = "default-user-id";

  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: [`/api/logs/${userId}?limit=${limit}`],
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    let filtered = logs;
    
    // Filtro por texto
    if (searchText) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchText.toLowerCase()) ||
        log.action.toLowerCase().includes(searchText.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Filtro por ação
    if (filterAction !== "all") {
      filtered = filtered.filter(log => log.action === filterAction);
    }
    
    // Filtro por tipo de entidade
    if (filterEntity !== "all") {
      filtered = filtered.filter(log => log.entityType === filterEntity);
    }
    
    return filtered;
  }, [logs, searchText, filterAction, filterEntity]);

  const clearAllFilters = () => {
    setSearchText("");
    setFilterAction("all");
    setFilterEntity("all");
  };

  const formatLogTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Database className="w-4 h-4" />;
      case 'update':
        return <FileText className="w-4 h-4" />;
      case 'delete':
        return <X className="w-4 h-4" />;
      case 'payment':
        return <Clock className="w-4 h-4" />;
      default:
        return <ScrollText className="w-4 h-4" />;
    }
  };

  return (
    <div className="pb-safe">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <ScrollText className="w-8 h-8 text-primary" />
                Logs do Sistema
              </h1>
              <p className="text-muted-foreground">
                Acompanhe todas as atividades e mudanças no sistema
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
                data-testid="button-toggle-filters"
              >
                <Filter size={16} />
                Filtros
              </Button>
              
              <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 itens</SelectItem>
                  <SelectItem value="50">50 itens</SelectItem>
                  <SelectItem value="100">100 itens</SelectItem>
                  <SelectItem value="200">200 itens</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filtros expansíveis */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Busca por texto */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buscar:</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar nos logs..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="pl-8"
                        data-testid="input-search"
                      />
                      {searchText && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-6 w-6 p-0"
                          onClick={() => setSearchText('')}
                          data-testid="button-clear-search"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Filtro por ação */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ação:</label>
                    <Select value={filterAction} onValueChange={setFilterAction}>
                      <SelectTrigger data-testid="select-action">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as ações</SelectItem>
                        <SelectItem value="create">Criação</SelectItem>
                        <SelectItem value="update">Atualização</SelectItem>
                        <SelectItem value="delete">Exclusão</SelectItem>
                        <SelectItem value="payment">Pagamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por tipo de entidade */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo:</label>
                    <Select value={filterEntity} onValueChange={setFilterEntity}>
                      <SelectTrigger data-testid="select-entity">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="bill">Contas</SelectItem>
                        <SelectItem value="income">Receitas</SelectItem>
                        <SelectItem value="category">Categorias</SelectItem>
                        <SelectItem value="goal">Metas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Resumo dos filtros */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                      {filteredLogs.length} logs encontrados
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                    data-testid="button-clear-filters"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Logs de Atividade</span>
              <Badge variant="outline">{filteredLogs.length} registros</Badge>
            </CardTitle>
            <CardDescription>
              Registros de todas as ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {/* Cabeçalho da tabela */}
              <div className="grid grid-cols-12 gap-2 p-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b sticky top-0">
                <div className="col-span-3">Data/Hora</div>
                <div className="col-span-2">Ação</div>
                <div className="col-span-2">Tipo</div>
                <div className="col-span-5">Descrição</div>
              </div>
              
              {/* Lista de logs */}
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p>Carregando logs...</p>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <ScrollText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Nenhum log encontrado</p>
                    {(searchText || filterAction !== "all" || filterEntity !== "all") && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs mt-2"
                      >
                        Limpar filtros para ver todos os logs
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className={`grid grid-cols-12 gap-2 p-3 hover:bg-muted/50 transition-colors text-sm ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      }`}
                      data-testid={`log-row-${log.id}`}
                    >
                      <div className="col-span-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs">{formatLogTime(log.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <Badge variant="outline" className={`text-xs ${actionColors[log.action as keyof typeof actionColors] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          <div className="flex items-center gap-1">
                            {getActionIcon(log.action)}
                            <span className="capitalize">{log.action}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="col-span-2">
                        <Badge variant="outline" className={`text-xs ${entityTypeColors[log.entityType as keyof typeof entityTypeColors] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {log.entityType === 'bill' ? 'Conta' : 
                           log.entityType === 'income' ? 'Receita' :
                           log.entityType === 'category' ? 'Categoria' :
                           log.entityType === 'goal' ? 'Meta' : 
                           log.entityType}
                        </Badge>
                      </div>
                      
                      <div className="col-span-5">
                        <p className="text-sm text-foreground">{log.message}</p>
                        {log.metadata && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {log.metadata}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}