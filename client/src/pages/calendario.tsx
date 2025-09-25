import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  
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

  // Filtrar eventos por data
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      event.dueDate.toDateString() === date.toDateString()
    );
  };

  // Verificar se uma data tem eventos
  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  // Próximos vencimentos (próximos 7 dias)
  const getUpcomingEvents = () => {
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    
    return calendarEvents.filter(event => 
      event.dueDate >= today && event.dueDate <= weekFromNow
    );
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Calendário Financeiro</h1>
              <p className="text-muted-foreground">
                Visualize seus vencimentos e recebimentos em formato de calendário
              </p>
            </div>
            
            <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <TabsList>
                <TabsTrigger value="month">Mês</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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