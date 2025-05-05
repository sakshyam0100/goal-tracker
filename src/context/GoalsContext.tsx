import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Goal, Milestone, Category } from '../types';
import { mockGoals } from '../data/mockGoals';
import { defaultCategories } from '../data/categories';

interface GoalsContextType {
  goals: Goal[];
  categories: Category[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  addMilestone: (goalId: string, milestone: Omit<Milestone, 'id'>) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  getGoalsByCategory: (categoryId: string) => Goal[];
  getUpcomingGoals: (days: number) => Goal[];
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  // Load from localStorage on mount if available
  useEffect(() => {
    const savedGoals = localStorage.getItem('goals');
    const savedCategories = localStorage.getItem('categories');
    
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        // Convert string dates back to Date objects
        parsedGoals.forEach((goal: any) => {
          goal.targetDate = new Date(goal.targetDate);
          goal.createdAt = new Date(goal.createdAt);
          goal.updatedAt = new Date(goal.updatedAt);
          goal.milestones.forEach((milestone: any) => {
            if (milestone.dueDate) {
              milestone.dueDate = new Date(milestone.dueDate);
            }
          });
        });
        setGoals(parsedGoals);
      } catch (error) {
        console.error('Failed to parse saved goals', error);
      }
    }
    
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Failed to parse saved categories', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [goals, categories]);

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(
      goals.map(goal => 
        goal.id === id 
          ? { ...goal, ...updates, updatedAt: new Date() } 
          : goal
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const archiveGoal = (id: string) => {
    updateGoal(id, { isArchived: true });
  };

  const addMilestone = (goalId: string, milestone: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: Date.now().toString()
    };
    
    setGoals(
      goals.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              milestones: [...goal.milestones, newMilestone],
              updatedAt: new Date()
            } 
          : goal
      )
    );
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(
      goals.map(goal => {
        if (goal.id !== goalId) return goal;
        
        const updatedMilestones = goal.milestones.map(milestone => 
          milestone.id === milestoneId 
            ? { ...milestone, isCompleted: !milestone.isCompleted }
            : milestone
        );
        
        // Calculate new progress based on completed milestones
        const totalMilestones = updatedMilestones.length;
        const completedMilestones = updatedMilestones.filter(m => m.isCompleted).length;
        const newProgress = totalMilestones > 0 
          ? Math.round((completedMilestones / totalMilestones) * 100) 
          : goal.progress;
        
        return {
          ...goal,
          milestones: updatedMilestones,
          progress: newProgress,
          updatedAt: new Date()
        };
      })
    );
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    setCategories([...categories, newCategory]);
  };

  const getGoalsByCategory = (categoryId: string) => {
    return goals.filter(goal => goal.category.id === categoryId && !goal.isArchived);
  };

  const getUpcomingGoals = (days: number) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return goals.filter(goal => {
      const targetDate = new Date(goal.targetDate);
      return targetDate >= today && targetDate <= futureDate && !goal.isArchived;
    });
  };

  return (
    <GoalsContext.Provider
      value={{
        goals,
        categories,
        addGoal,
        updateGoal,
        deleteGoal,
        archiveGoal,
        addMilestone,
        toggleMilestone,
        addCategory,
        getGoalsByCategory,
        getUpcomingGoals
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};