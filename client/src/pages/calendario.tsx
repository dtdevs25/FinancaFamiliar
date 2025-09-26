import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Search,
  X
} from "lucide-react";
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isSameMonth, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarEvent {
  id: string;
  title: string;
  amount: number;
  type: 'bill' | 'income';
  dueDate: Date;
  category?: any;
  isPaid?: boolean;
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'bills' | 'income'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchText, setSearchText] = useState('');
  
  const userId = "default-user-id";

  const { data: bills = [] } = useQuery<any[]>({
    queryKey: ["/api/bills", userId],
  });

  const { data: incomes = [] } = useQuery<any[]>({
    queryKey: ["/api/incomes", userId],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories", userId],
  });

  // Gerar eventos do calendário baseado na data/período sendo visualizado
  const generateCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    
    // Calcular range de datas para incluir eventos
    let rangeStart: Date, rangeEnd: Date;
    if (viewMode === 'week') {
      rangeStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      rangeEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    } else {
      rangeStart = startOfMonth(currentDate);
      rangeEnd = endOfMonth(currentDate);
    }

    // Adicionar contas - considerando o range completo
    bills.forEach((bill: any) => {
      // Para semanas que cruzam meses, gerar eventos para ambos os meses
      const startMonth = rangeStart.getMonth();
      const startYear = rangeStart.getFullYear();
      const endMonth = rangeEnd.getMonth();
      const endYear = rangeEnd.getFullYear();
      
      // Se está no mesmo mês/ano, ou se cruza mês/ano
      const monthsToCheck = [];
      if (startYear === endYear && startMonth === endMonth) {
        monthsToCheck.push({ month: startMonth, year: startYear });
      } else {
        monthsToCheck.push({ month: startMonth, year: startYear });
        monthsToCheck.push({ month: endMonth, year: endYear });
      }
      
      monthsToCheck.forEach(({ month, year }) => {
        const dueDate = new Date(year, month, bill.dueDay);
        // Verificar se a data está dentro do range e é válida
        if (dueDate >= rangeStart && dueDate <= rangeEnd && 
            bill.dueDay <= new Date(year, month + 1, 0).getDate()) {
          events.push({
            id: `${bill.id}-${month}-${year}`,
            title: bill.name,
            amount: parseFloat(bill.amount),
            type: 'bill',
            dueDate,
            category: categories.find((cat: any) => cat.id === bill.categoryId),
            isPaid: bill.isPaid
          });
        }
      });
    });

    // Adicionar receitas recorrentes - considerando o range completo
    incomes.forEach((income: any) => {
      if (income.isRecurring && income.receiptDay) {
        // Para semanas que cruzam meses, gerar eventos para ambos os meses
        const startMonth = rangeStart.getMonth();
        const startYear = rangeStart.getFullYear();
        const endMonth = rangeEnd.getMonth();
        const endYear = rangeEnd.getFullYear();
        
        // Se está no mesmo mês/ano, ou se cruza mês/ano
        const monthsToCheck = [];
        if (startYear === endYear && startMonth === endMonth) {
          monthsToCheck.push({ month: startMonth, year: startYear });
        } else {
          monthsToCheck.push({ month: startMonth, year: startYear });
          monthsToCheck.push({ month: endMonth, year: endYear });
        }
        
        monthsToCheck.forEach(({ month, year }) => {
          const receiptDate = new Date(year, month, income.receiptDay);
          // Verificar se a data está dentro do range e é válida
          if (receiptDate >= rangeStart && receiptDate <= rangeEnd &&
              income.receiptDay <= new Date(year, month + 1, 0).getDate()) {
            events.push({
              id: `${income.id}-${month}-${year}`,
              title: income.description,
              amount: parseFloat(income.amount),
              type: 'income',
              dueDate: receiptDate
            });
          }
        });
      }
      
      // Adicionar receitas únicas com data específica
      if (!income.isRecurring && income.date) {
        const incomeDate = new Date(income.date);
        // Verificar se a data está dentro do range
        if (incomeDate >= rangeStart && incomeDate <= rangeEnd) {
          events.push({
            id: `${income.id}-oneoff`,
            title: income.description,
            amount: parseFloat(income.amount),
            type: 'income',
            dueDate: incomeDate
          });
        }
      }
    });

    return events.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  const calendarEvents = useMemo(() => generateCalendarEvents(), [bills, incomes, categories, currentDate, viewMode]);

  // Funções de navegação
  const navigatePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Cálculos de data baseados no modo de visualização
  const { displayRange, displayTitle } = useMemo(() => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return {
        displayRange: { start: monthStart, end: monthEnd },
        displayTitle: format(currentDate, 'MMMM yyyy', { locale: ptBR })
      };
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return {
        displayRange: { start: weekStart, end: weekEnd },
        displayTitle: `${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`
      };
    }
    return {
      displayRange: { start: currentDate, end: currentDate },
      displayTitle: format(currentDate, 'dd MMMM yyyy', { locale: ptBR })
    };
  }, [currentDate, viewMode]);

  // Filtrar eventos por tipo, categoria, status e texto
  const filteredEvents = useMemo(() => {
    let events = calendarEvents;
    
    // Filtro por tipo
    if (filterType !== 'all') {
      events = events.filter(event => event.type === (filterType === 'bills' ? 'bill' : 'income'));
    }
    
    // Filtro por categoria
    if (filterCategory !== 'all') {
      events = events.filter(event => event.category?.id === filterCategory);
    }
    
    // Filtro por status (apenas para contas)
    if (filterStatus !== 'all') {
      events = events.filter(event => {
        if (event.type === 'income') return true; // Receitas sempre aparecem
        return filterStatus === 'paid' ? event.isPaid : !event.isPaid;
      });
    }
    
    // Filtro por texto
    if (searchText) {
      events = events.filter(event => 
        event.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return events;
  }, [calendarEvents, filterType, filterCategory, filterStatus, searchText]);

  // Funções auxiliares para o calendário
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.dueDate, date));
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const getUpcomingEvents = () => {
    const startDate = displayRange.start;
    const endDate = displayRange.end;
    const nextWeek = new Date(endDate);
    nextWeek.setDate(endDate.getDate() + 7);
    
    return filteredEvents
      .filter(event => event.dueDate >= startDate && event.dueDate <= nextWeek)
      .slice(0, 5);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };


  return (
    <div className="pb-safe">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-primary" />
                Calendário Financeiro
              </h1>
              <p className="text-muted-foreground">
                Visualize e gerencie seus compromissos financeiros
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* Botões de filtro */}
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
              
              
              {/* View mode tabs */}
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="bg-background rounded-lg shadow-sm border">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="month" className="text-sm">Mês</TabsTrigger>
                  <TabsTrigger value="week" className="text-sm">Semana</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Filtros expansíveis */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Busca por texto */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buscar:</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nome da conta..."
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

                  {/* Filtro por tipo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo:</label>
                    <Tabs value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                        <TabsTrigger value="bills" className="text-xs">Contas</TabsTrigger>
                        <TabsTrigger value="income" className="text-xs">Receitas</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Filtro por categoria */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria:</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status:</label>
                    <Select value={filterStatus} onValueChange={(value: 'all' | 'paid' | 'unpaid') => setFilterStatus(value)}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="unpaid">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Resumo dos filtros e botão limpar */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      {filteredEvents.filter(e => e.type === 'income').length} Receitas
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                      {filteredEvents.filter(e => e.type === 'bill').length} Contas
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                      {filteredEvents.length} Total
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterType('all');
                      setFilterCategory('all');
                      setFilterStatus('all');
                      setSearchText('');
                    }}
                    className="text-xs"
                    data-testid="button-clear-filters"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Navegação de datas */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigatePrevious}
                    data-testid="button-navigate-previous"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateToday}
                    data-testid="button-navigate-today"
                  >
                    Hoje
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateNext}
                    data-testid="button-navigate-next"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
                
                <h2 className="text-2xl font-bold text-foreground capitalize">
                  {displayTitle}
                </h2>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>R$ {filteredEvents.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span>R$ {filteredEvents.filter(e => e.type === 'bill').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {displayTitle}
                </CardTitle>
                <CardDescription>
                  Clique em uma data para ver os eventos do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasEvents: (date) => hasEvents(date),
                    today: new Date(),
                  }}
                  modifiersStyles={{
                    hasEvents: {
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontWeight: 'bold'
                    },
                    today: {
                      backgroundColor: '#3b82f6',
                      color: 'white'
                    }
                  }}
                  data-testid="calendar-main"
                />
              </CardContent>
            </Card>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-4">
            {/* Lista Tabular de Eventos do Período */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Eventos do Período</span>
                  <Badge variant="outline">{filteredEvents.length} itens</Badge>
                </CardTitle>
                <CardDescription>
                  {selectedDate ? 
                    `Mostrando eventos para ${selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}` :
                    `Todos os eventos de ${displayTitle.toLowerCase()}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {/* Cabeçalho da tabela */}
                  <div className="grid grid-cols-12 gap-2 p-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b sticky top-0">
                    <div className="col-span-1">Dia</div>
                    <div className="col-span-5">Título</div>
                    <div className="col-span-3">Valor</div>
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-1">Status</div>
                  </div>
                  
                  {/* Lista de eventos */}
                  <div className="divide-y">
                    {(selectedDate ? getEventsForDate(selectedDate) : filteredEvents).map((event, index) => (
                      <div
                        key={event.id}
                        className={`grid grid-cols-12 gap-2 p-3 hover:bg-muted/50 cursor-pointer transition-colors text-sm ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                        onClick={() => handleEventClick(event)}
                        data-testid={`event-row-${event.id}`}
                      >
                        <div className="col-span-1 font-medium text-foreground">
                          {event.dueDate.getDate()}
                        </div>
                        <div className="col-span-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              event.type === 'bill' 
                                ? (event.isPaid ? 'bg-green-500' : 'bg-red-500')
                                : 'bg-blue-500'
                            }`}></div>
                            <span className="truncate font-medium">{event.title}</span>
                          </div>
                          {event.category && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {event.category.name}
                            </div>
                          )}
                        </div>
                        <div className="col-span-3">
                          <div className={`font-bold ${
                            event.type === 'bill' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            R$ {event.amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Badge variant="outline" className={`text-xs ${
                            event.type === 'bill' ? 'border-red-200 text-red-700 bg-red-50' : 'border-blue-200 text-blue-700 bg-blue-50'
                          }`}>
                            {event.type === 'bill' ? 'Conta' : 'Receita'}
                          </Badge>
                        </div>
                        <div className="col-span-1">
                          {event.type === 'bill' && (
                            <Badge variant={event.isPaid ? "default" : "secondary"} className="text-xs">
                              {event.isPaid ? '✓' : '○'}
                            </Badge>
                          )}
                          {event.type === 'income' && (
                            <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(selectedDate ? getEventsForDate(selectedDate) : filteredEvents).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">
                          {selectedDate ? 'Nenhum evento nesta data' : 'Nenhum evento encontrado'}
                        </p>
                        {selectedDate && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setSelectedDate(undefined)}
                            className="text-xs mt-2"
                          >
                            Ver todos os eventos do período
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Período</CardTitle>
                <CardDescription>
                  Totais de {displayTitle.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Total a Receber
                    </span>
                    <span className="font-bold text-blue-600">
                      R$ {filteredEvents
                        .filter(e => e.type === 'income')
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      Total a Pagar
                    </span>
                    <span className="font-bold text-red-600">
                      R$ {filteredEvents
                        .filter(e => e.type === 'bill')
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      Contas Pagas
                    </span>
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {filteredEvents.filter(e => e.type === 'bill' && e.isPaid).length} / {filteredEvents.filter(e => e.type === 'bill').length}
                    </Badge>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Saldo do Período</span>
                      <span className={`font-bold ${
                        (filteredEvents.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) - 
                         filteredEvents.filter(e => e.type === 'bill').reduce((sum, e) => sum + e.amount, 0)) >= 0 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        R$ {(filteredEvents.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) - 
                             filteredEvents.filter(e => e.type === 'bill').reduce((sum, e) => sum + e.amount, 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Detalhes do Evento */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <DialogDescription>
                {selectedEvent?.type === 'bill' ? 'Conta a pagar' : 'Receita'}
              </DialogDescription>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Valor:</span>
                  <span className={`font-bold text-lg ${
                    selectedEvent.type === 'bill' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    R$ {selectedEvent.amount.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Data:</span>
                  <span>{selectedEvent.dueDate.toLocaleDateString('pt-BR')}</span>
                </div>
                
                {selectedEvent.category && (
                  <div className="flex items-center justify-between">
                    <span>Categoria:</span>
                    <Badge style={{ backgroundColor: selectedEvent.category.color }}>
                      {selectedEvent.category.name}
                    </Badge>
                  </div>
                )}
                
                {selectedEvent.type === 'bill' && (
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant={selectedEvent.isPaid ? "default" : "secondary"}>
                      {selectedEvent.isPaid ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}