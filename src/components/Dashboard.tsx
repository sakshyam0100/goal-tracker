import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Category, Goal } from '../types';
import { ProgressCircle } from './ui/ProgressCircle';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  goals: Goal[];
  categories: Category[];
}

export const Dashboard: React.FC<DashboardProps> = ({ goals, categories }) => {
  const [averageProgress, setAverageProgress] = useState(0);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Goal[]>([]);
  const [categoryData, setCategoryData] = useState<{
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    // Calculate average progress
    if (goals.length > 0) {
      const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
      setAverageProgress(Math.round(totalProgress / goals.length));
    }

    // Get upcoming deadlines (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcoming = goals.filter(goal => {
      const targetDate = new Date(goal.targetDate);
      return targetDate >= today && targetDate <= nextWeek && !goal.isArchived;
    });

    // Sort by closest deadline
    upcoming.sort((a, b) => 
      new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );
    
    setUpcomingDeadlines(upcoming);

    // Process category data for the chart
    const categoryCounts: { [key: string]: number } = {};
    
    categories.forEach(category => {
      categoryCounts[category.id] = 0;
    });
    
    goals.forEach(goal => {
      if (!goal.isArchived) {
        categoryCounts[goal.category.id] = (categoryCounts[goal.category.id] || 0) + 1;
      }
    });
    
    setCategoryData({
      labels: categories.map(cat => cat.name),
      datasets: [
        {
          data: categories.map(cat => categoryCounts[cat.id] || 0),
          backgroundColor: categories.map(cat => cat.color + '80'), // 50% opacity
          borderColor: categories.map(cat => cat.color),
          borderWidth: 1,
        },
      ],
    });
  }, [goals, categories]);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Overall Progress</h3>
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              <ProgressCircle 
                progress={averageProgress} 
                size={100} 
                strokeWidth={8}
                showText={false}
              />
              <p className="text-3xl font-bold text-gray-800 mt-2">{averageProgress}%</p>
              <p className="text-sm text-gray-500">Average Completion</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Goals by Category</h3>
          <div className="h-[150px] flex items-center justify-center">
            {categoryData.datasets[0].data.some(value => value > 0) ? (
              <Doughnut 
                data={categoryData}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw as number;
                          const total = (context.dataset.data as number[]).reduce((a, b) => (a as number) + (b as number), 0) as number;
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: '70%',
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <p className="text-gray-500 text-sm">No goals created yet</p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="truncate">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Upcoming Deadlines</h3>
          {upcomingDeadlines.length > 0 ? (
            <ul className="space-y-3">
              {upcomingDeadlines.slice(0, 5).map(goal => (
                <li 
                  key={goal.id}
                  className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-100"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-full rounded-l-md"
                      style={{ 
                        backgroundColor: goal.category.color,
                        marginLeft: '-0.5rem',
                        marginRight: '0.5rem',
                      }}
                    ></div>
                    <span className="text-sm font-medium truncate" style={{ maxWidth: '150px' }}>
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(goal.targetDate)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 text-sm">No upcoming deadlines</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};