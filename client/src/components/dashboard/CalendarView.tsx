import { useState } from "react";
import type { Bill, Income } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, DollarSign, CreditCard, AlertCircle } from "lucide-react";

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
        color: isOverdue ? 'bg-red-500' : 'bg-amber-500',
        title: `${dayBills.length} conta(s)`
      });
    }

    // Check for incomes on this day
    const dayIncomes = incomes.filter(income => income.receiptDay === day);
    if (dayIncomes.length > 0) {
      events.push({
        type: 'income',
        color: 'bg-green-500',
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
        <div key={`prev-${i}`} className="p-3 text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-sm">{prevMonthDate}</span>
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
          className={`p-3 relative min-h-[60px] rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 ${
            isToday 
              ? 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-300 border-2 border-indigo-300 dark:border-indigo-700 font-semibold' 
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }`}
          data-testid={`calendar-day-${day}`}
        >
          <span className={`text-sm font-medium ${isToday ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>{day}</span>
          <div className="flex flex-wrap gap-1 mt-2">
            {events.map((event, index) => {
              const isIncome = event.type === 'income';
              const isOverdue = event.type === 'overdue';
              return (
                <div 
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    isIncome 
                      ? 'bg-green-500' 
                      : isOverdue 
                        ? 'bg-red-500' 
                        : 'bg-amber-500'
                  }`}
                  title={event.title}
                ></div>
              );
            })}
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
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visualize vencimentos e receitas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="h-8 w-8 p-0"
              data-testid="button-previous-month"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0"
              data-testid="button-next-month"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
          {weekDays.map((day) => (
            <div key={day} className="p-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2 text-sm mb-6">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center flex-wrap gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-full">
              <DollarSign className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/20 rounded-full">
              <CreditCard className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vencimentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Atrasados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
