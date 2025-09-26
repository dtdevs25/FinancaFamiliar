import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Grid3X3,
  List
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
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'bills' | 'income'>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  
  const userId = "default-user-id";

  const { data: bills = [] } = useQuery({
    queryKey: ["/api/bills", userId],
  });

  const { data: incomes = [] } = useQuery({
    queryKey: ["/api/incomes", userId],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", userId],
  });

  // Gerar eventos do calendário
  const generateCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Adicionar contas
    bills.forEach((bill: any) => {
      const dueDate = new Date(currentYear, currentMonth, bill.dueDay);
      if (bill.dueDay <= new Date(currentYear, currentMonth + 1, 0).getDate()) {
        events.push({
          id: bill.id,
          title: bill.name,
          amount: parseFloat(bill.amount),
          type: 'bill',
          dueDate,
          category: categories.find((cat: any) => cat.id === bill.categoryId),
          isPaid: bill.isPaid
        });
      }
    });

    // Adicionar receitas
    incomes.forEach((income: any) => {
      if (income.receiptDay) {
        const receiptDate = new Date(currentYear, currentMonth, income.receiptDay);
        if (income.receiptDay <= new Date(currentYear, currentMonth + 1, 0).getDate()) {
          events.push({
            id: income.id,
            title: income.description,
            amount: parseFloat(income.amount),
            type: 'income',
            dueDate: receiptDate
          });
        }
      }
    });

    return events.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  const calendarEvents = generateCalendarEvents();

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

  // Filtrar eventos por tipo
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return calendarEvents;
    return calendarEvents.filter(event => event.type === (filterType === 'bills' ? 'bill' : 'income'));
  }, [calendarEvents, filterType]);

  // Funções auxiliares para o calendário
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => isSameDay(event.dueDate, date));
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return calendarEvents
      .filter(event => event.dueDate >= today && event.dueDate <= nextWeek)
      .slice(0, 5);
  };


  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const EventCard = ({ event }: { event: CalendarEvent }) => (
    <div 
      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        event.type === 'bill' 
          ? (event.isPaid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
          : 'bg-blue-50 border-blue-200'
      }`}
      onClick={() => handleEventClick(event)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            event.type === 'bill' 
              ? (event.isPaid ? 'bg-green-500' : 'bg-red-500')
              : 'bg-blue-500'
          }`}></div>
          <span className="font-medium text-sm">{event.title}</span>
        </div>
        <div className="text-right">
          <div className={`font-bold text-sm ${
            event.type === 'bill' ? 'text-red-600' : 'text-blue-600'
          }`}>
            R$ {event.amount.toFixed(2)}
          </div>
          {event.isPaid && (
            <Badge variant="outline" className="text-xs">Pago</Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header moderno */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                Calendário Financeiro
              </h1>
              <p className="text-muted-foreground text-lg">
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
              
              {/* Layout toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border">
                <Button
                  variant={layoutMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLayoutMode('grid')}
                  data-testid="button-grid-view"
                >
                  <Grid3X3 size={16} />
                </Button>
                <Button
                  variant={layoutMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLayoutMode('list')}
                  data-testid="button-list-view"
                >
                  <List size={16} />
                </Button>
              </div>
              
              {/* View mode tabs */}
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="month" className="text-sm">Mês</TabsTrigger>
                  <TabsTrigger value="week" className="text-sm">Semana</TabsTrigger>
                  <TabsTrigger value="agenda" className="text-sm">Agenda</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Filtros expansíveis */}
          {showFilters && (
            <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Tipo:</label>
                    <Tabs value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                      <TabsList className="h-8">
                        <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                        <TabsTrigger value="bills" className="text-xs">Contas</TabsTrigger>
                        <TabsTrigger value="income" className="text-xs">Receitas</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      {filteredEvents.filter(e => e.type === 'income').length} Receitas
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                      {filteredEvents.filter(e => e.type === 'bill').length} Contas
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Navegação de datas moderna */}
          <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigatePrevious}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                    data-testid="button-navigate-previous"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateToday}
                    className="px-4 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                    data-testid="button-navigate-today"
                  >
                    Hoje
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateNext}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
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
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
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
                />
              </CardContent>
            </Card>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-6">
            {/* Eventos do Dia Selecionado */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate.toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </CardTitle>
                  <CardDescription>
                    {getEventsForDate(selectedDate).length} evento(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                    
                    {getEventsForDate(selectedDate).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <i className="fas fa-calendar-times text-2xl mb-2"></i>
                        <p className="text-sm">Nenhum evento nesta data</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Próximos Vencimentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximos 7 Dias</CardTitle>
                <CardDescription>
                  Vencimentos e recebimentos próximos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUpcomingEvents().map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 rounded border-l-4"
                         style={{ borderLeftColor: event.type === 'bill' ? '#EF4444' : '#3B82F6' }}>
                      <div>
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.dueDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${
                        event.type === 'bill' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        R$ {event.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  {getUpcomingEvents().length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <i className="fas fa-check-circle text-2xl mb-2 text-green-500"></i>
                      <p className="text-sm">Nenhum vencimento próximo</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo do Mês */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total a Receber</span>
                    <span className="font-bold text-blue-600">
                      R$ {calendarEvents
                        .filter(e => e.type === 'income')
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total a Pagar</span>
                    <span className="font-bold text-red-600">
                      R$ {calendarEvents
                        .filter(e => e.type === 'bill')
                        .reduce((sum, e) => sum + e.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Contas Pagas</span>
                    <Badge variant="outline">
                      {calendarEvents.filter(e => e.type === 'bill' && e.isPaid).length} / {calendarEvents.filter(e => e.type === 'bill').length}
                    </Badge>
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
      </div>
    </div>
  );
}