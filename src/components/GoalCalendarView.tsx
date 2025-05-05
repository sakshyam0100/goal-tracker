import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Goal } from '../types';
import { Button } from './ui/Button';

interface GoalCalendarViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
}

export const GoalCalendarView: React.FC<GoalCalendarViewProps> = ({ goals, onSelectGoal }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<Date | null>>([]);
  const [goalsMap, setGoalsMap] = useState<Record<string, Goal[]>>({});

  useEffect(() => {
    generateCalendarDays();
    mapGoalsToDate();
  }, [currentMonth, goals]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Get the day of the week of the first day (0-6, 0 is Sunday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Initialize calendar array
    const days: Array<Date | null> = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add empty cells to complete the last week
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }
    
    setCalendarDays(days);
  };

  const mapGoalsToDate = () => {
    const map: Record<string, Goal[]> = {};
    
    goals.forEach(goal => {
      if (goal.isArchived) return;
      
      const targetDate = new Date(goal.targetDate);
      const dateKey = targetDate.toISOString().split('T')[0];
      
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      
      map[dateKey].push(goal);
    });
    
    setGoalsMap(map);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Format date to YYYY-MM-DD for comparing
  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get goals for a specific date
  const getGoalsForDate = (date: Date): Goal[] => {
    const dateKey = formatDateKey(date);
    return goalsMap[dateKey] || [];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth('prev')}
            icon={<ChevronLeft size={14} />}
            aria-label="Previous month"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth('next')}
            icon={<ChevronRight size={14} />}
            aria-label="Next month"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-7 bg-gray-50 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-xs font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((date, i) => (
          <div 
            key={i}
            className={`min-h-[100px] p-1 border-t border-l border-gray-100 ${
              i % 7 === 6 ? 'border-r' : ''
            } ${
              i >= calendarDays.length - 7 ? 'border-b' : ''
            }`}
          >
            {date && (
              <>
                <div className={`text-right p-1 ${
                  isToday(date) 
                    ? 'bg-blue-100 text-blue-800 rounded-full w-7 h-7 ml-auto flex items-center justify-center' 
                    : ''
                }`}>
                  {date.getDate()}
                </div>
                <div className="mt-1 space-y-1 max-h-[72px] overflow-y-auto">
                  {getGoalsForDate(date).map(goal => (
                    <div 
                      key={goal.id}
                      onClick={() => onSelectGoal(goal)}
                      className="text-xs p-1 rounded cursor-pointer truncate"
                      style={{ 
                        backgroundColor: `${goal.category.color}15`,
                        borderLeft: `3px solid ${goal.category.color}`
                      }}
                    >
                      {goal.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};