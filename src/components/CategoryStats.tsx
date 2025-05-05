import React from 'react';
import { Goal, Category } from '../types';
import { ProgressCircle } from './ui/ProgressCircle';

interface CategoryStatsProps {
  goals: Goal[];
  categories: Category[];
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({ goals, categories }) => {
  // Calculate stats for each category
  const getCategoryStats = (categoryId: string) => {
    const categoryGoals = goals.filter(
      goal => goal.category.id === categoryId && !goal.isArchived
    );
    
    if (categoryGoals.length === 0) {
      return {
        count: 0,
        avgProgress: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
      };
    }
    
    const totalProgress = categoryGoals.reduce((sum, goal) => sum + goal.progress, 0);
    const avgProgress = Math.round(totalProgress / categoryGoals.length);
    
    const completed = categoryGoals.filter(goal => goal.progress === 100).length;
    const notStarted = categoryGoals.filter(goal => goal.progress === 0).length;
    const inProgress = categoryGoals.length - completed - notStarted;
    
    return {
      count: categoryGoals.length,
      avgProgress,
      completed,
      inProgress,
      notStarted,
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Category Performance</h2>
      </div>
      
      <ul className="divide-y divide-gray-100">
        {categories.map(category => {
          const stats = getCategoryStats(category.id);
          
          return (
            <li key={category.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <h3 className="font-medium text-gray-800">{category.name}</h3>
                </div>
                
                <ProgressCircle 
                  progress={stats.avgProgress} 
                  color={category.color}
                  size={36}
                />
              </div>
              
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="text-xs">
                  <p className="text-gray-500">Not Started</p>
                  <p className="font-semibold text-gray-800 mt-1">{stats.notStarted}</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-500">In Progress</p>
                  <p className="font-semibold text-gray-800 mt-1">{stats.inProgress}</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-500">Completed</p>
                  <p className="font-semibold text-gray-800 mt-1">{stats.completed}</p>
                </div>
              </div>
            </li>
          );
        })}
        
        {categories.length === 0 && (
          <li className="p-5 text-center">
            <p className="text-gray-500">No categories found</p>
          </li>
        )}
      </ul>
    </div>
  );
};