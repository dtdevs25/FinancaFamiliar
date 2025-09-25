import { useState } from "react";
import type { Bill, Income } from "@shared/schema";

interface CalendarViewProps {
  bills: Bill[];
  incomes: Income[];
}

export default function CalendarView({ bills, incomes }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date().getDate();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    const events = [];

    // Check for bills due on this day
    const dayBills = bills.filter(bill => bill.dueDay === day);
    if (dayBills.length > 0) {
      const isOverdue = day < today;
      events.push({
        type: isOverdue ? 'overdue' : 'bill',
        color: isOverdue ? 'bg-destructive' : 'bg-warning',
        title: `${dayBills.length} conta(s)`
      });
    }

    // Check for incomes on this day
    const dayIncomes = incomes.filter(income => income.receiptDay === day);
    if (dayIncomes.length > 0) {
      events.push({
        type: 'income',
        color: 'bg-success',
        title: `Receita - ${dayIncomes[0].source}`
      });
    }

    return events;
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDate = new Date(currentYear, currentMonth, 0).getDate() - firstDayOfMonth + i + 1;
      days.push(
        <div key={`prev-${i}`} className="p-2 text-muted-foreground">
          {prevMonthDate}
        </div>
      );
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDay(day);
      const isToday = day === today && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

      days.push(
        <div 
          key={day} 
          className={`p-2 relative min-h-[40px] ${isToday ? 'bg-primary/10 text-primary rounded-lg font-medium' : ''}`}
          data-testid={`calendar-day-${day}`}
        >
          <span className="text-sm">{day}</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {events.map((event, index) => (
              <div 
                key={index}
                className={`w-2 h-2 ${event.color} rounded-full`}
                title={event.title}
              ></div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Calendário - {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 hover:bg-muted/50 rounded-lg" 
            onClick={previousMonth}
            data-testid="button-previous-month"
          >
            <i className="fas fa-chevron-left text-muted-foreground"></i>
          </button>
          <button 
            className="p-2 hover:bg-muted/50 rounded-lg" 
            onClick={nextMonth}
            data-testid="button-next-month"
          >
            <i className="fas fa-chevron-right text-muted-foreground"></i>
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
        {weekDays.map((day) => (
          <div key={day} className="p-2 font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success rounded-full"></div>
          <span className="text-muted-foreground">Receitas</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-warning rounded-full"></div>
          <span className="text-muted-foreground">Vencimentos</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-destructive rounded-full"></div>
          <span className="text-muted-foreground">Atrasados</span>
        </div>
      </div>
    </div>
  );
}
