export interface Goal {
  id: string;
  title: string;
  description: string;
  category: Category;
  targetDate: Date;
  progress: number; // 0-100
  milestones: Milestone[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: Date;
}

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type TimeFrame = 'day' | 'week' | 'month' | 'year';

export type ViewMode = 'grid' | 'list' | 'calendar';