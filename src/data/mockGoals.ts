import { Goal } from '../types';
import { defaultCategories } from './categories';

// Helper to create dates relative to today
const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Learn React Advanced Patterns',
    description: 'Master advanced React patterns like compound components and render props',
    category: defaultCategories[3], // Education
    targetDate: daysFromNow(30),
    progress: 45,
    milestones: [
      { id: 'm1', title: 'Complete React hooks course', isCompleted: true },
      { id: 'm2', title: 'Build 3 projects using advanced patterns', isCompleted: false },
      { id: 'm3', title: 'Contribute to an open source React project', isCompleted: false },
    ],
    isArchived: false,
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-2),
  },
  {
    id: '2',
    title: 'Run a Half Marathon',
    description: 'Train and complete a half marathon in under 2 hours',
    category: defaultCategories[2], // Health
    targetDate: daysFromNow(90),
    progress: 30,
    milestones: [
      { id: 'm1', title: 'Run 5km without stopping', isCompleted: true },
      { id: 'm2', title: 'Run 10km under 1 hour', isCompleted: true },
      { id: 'm3', title: 'Run 15km under 1.5 hours', isCompleted: false },
      { id: 'm4', title: 'Complete half marathon', isCompleted: false },
    ],
    isArchived: false,
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-5),
  },
  {
    id: '3',
    title: 'Save for Vacation',
    description: 'Save $3000 for summer vacation to Italy',
    category: defaultCategories[4], // Finance
    targetDate: daysFromNow(120),
    progress: 65,
    milestones: [
      { id: 'm1', title: 'Save first $1000', isCompleted: true },
      { id: 'm2', title: 'Save second $1000', isCompleted: true },
      { id: 'm3', title: 'Save final $1000', isCompleted: false },
    ],
    isArchived: false,
    createdAt: daysFromNow(-60),
    updatedAt: daysFromNow(-3),
  },
  {
    id: '4',
    title: 'Redesign Personal Website',
    description: 'Update portfolio website with new projects and improved design',
    category: defaultCategories[0], // Personal
    targetDate: daysFromNow(45),
    progress: 10,
    milestones: [
      { id: 'm1', title: 'Gather design inspiration', isCompleted: true },
      { id: 'm2', title: 'Create wireframes', isCompleted: false },
      { id: 'm3', title: 'Implement new design', isCompleted: false },
      { id: 'm4', title: 'Add new portfolio items', isCompleted: false },
    ],
    isArchived: false,
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-15),
  },
  {
    id: '5',
    title: 'Complete Project Proposal',
    description: 'Finish and submit the Q3 project proposal for client approval',
    category: defaultCategories[1], // Work
    targetDate: daysFromNow(10),
    progress: 80,
    milestones: [
      { id: 'm1', title: 'Research market trends', isCompleted: true },
      { id: 'm2', title: 'Draft initial proposal', isCompleted: true },
      { id: 'm3', title: 'Get team feedback', isCompleted: true },
      { id: 'm4', title: 'Finalize and submit', isCompleted: false },
    ],
    isArchived: false,
    createdAt: daysFromNow(-20),
    updatedAt: daysFromNow(-1),
  },
];