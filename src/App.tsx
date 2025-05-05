import React, { useState, useEffect, createContext, useContext } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Menu, Plus, X, Calendar, LayoutGrid, List, MoreVertical, CheckCircle2, Circle, Trash2, Archive, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Types
interface Goal {
  id: string;
  title: string;
  description: string;
  category: Category;
  targetDate: Date;
  progress: number;
  milestones: Milestone[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: Date;
}

type Category = {
  id: string;
  name: string;
  color: string;
};

type TimeFrame = 'day' | 'week' | 'month' | 'year';
type ViewMode = 'grid' | 'list' | 'calendar';

// Helper to create dates relative to today
const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Default Categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Personal', color: '#3B82F6' },
  { id: '2', name: 'Work', color: '#F97316' },
  { id: '3', name: 'Health', color: '#10B981' },
  { id: '4', name: 'Education', color: '#8B5CF6' },
  { id: '5', name: 'Finance', color: '#14B8A6' },
];

// Mock Goals
const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Learn React Advanced Patterns',
    description: 'Master advanced React patterns like compound components and render props',
    category: defaultCategories[3],
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
    category: defaultCategories[2],
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
    category: defaultCategories[4],
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
    category: defaultCategories[0],
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
    category: defaultCategories[1],
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

// Context
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

// UI Components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'font-medium rounded-md transition-all duration-200 inline-flex items-center justify-center';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };

  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3 gap-1.5',
    md: 'text-sm py-2 px-4 gap-2',
    lg: 'text-base py-2.5 px-5 gap-2',
  };

  const classes = [
    baseStyle,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? 'w-full' : '',
    disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '',
    className,
  ].join(' ');

  return (
    <button 
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
};

interface BadgeProps {
  text: string;
  color?: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  text, 
  color = '#3B82F6',
  className = '' 
}) => {
  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ 
        backgroundColor: `${color}15`,
        color: color 
      }}
    >
      {text}
    </span>
  );
};

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  color?: string;
  className?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 40,
  strokeWidth = 4,
  showText = true,
  color = '#3B82F6',
  className = '',
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedProgress / 100) * circumference;
  const center = size / 2;
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium">{Math.round(normalizedProgress)}%</span>
        </div>
      )}
    </div>
  );
};

// Main Components
interface HeaderProps {
  onAddGoal: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddGoal, viewMode, setViewMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            GoalTracker
          </h1>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="bg-gray-100 p-1 rounded-md flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md ${viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}`}
              aria-label="Calendar view"
            >
              <Calendar size={18} />
            </button>
          </div>
          <Button 
            onClick={onAddGoal} 
            icon={<Plus size={16} />}
            className="shadow-sm"
          >
            Add Goal
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 flex-1">
              <div className="space-y-4">
                <div className="p-4">
                  <p className="font-medium mb-2">View Mode</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setViewMode('grid');
                        setMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-md flex flex-col items-center ${
                        viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100'
                      }`}
                    >
                      <LayoutGrid size={20} />
                      <span className="text-sm mt-1">Grid</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('list');
                        setMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-md flex flex-col items-center ${
                        viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100'
                      }`}
                    >
                      <List size={20} />
                      <span className="text-sm mt-1">List</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('calendar');
                        setMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-md flex flex-col items-center ${
                        viewMode === 'calendar' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100'
                      }`}
                    >
                      <Calendar size={20} />
                      <span className="text-sm mt-1">Calendar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button 
                onClick={() => {
                  onAddGoal();
                  setMobileMenuOpen(false);
                }}
                icon={<Plus size={16} />}
                fullWidth
              >
                Add Goal
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

interface DashboardProps {
  goals: Goal[];
  categories: Category[];
}

const Dashboard: React.FC<DashboardProps> = ({ goals, categories }) => {
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
    if (goals.length > 0) {
      const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
      setAverageProgress(Math.round(totalProgress / goals.length));
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcoming = goals
      .filter(goal => {
        const targetDate = new Date(goal.targetDate);
        return targetDate >= today && targetDate <= nextWeek && !goal.isArchived;
      })
      .sort((a, b) => 
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      );
    
    setUpcomingDeadlines(upcoming);

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
          backgroundColor: categories.map(cat => cat.color + '80'),
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

interface GoalCardProps {
  goal: Goal;
  onToggleMilestone: (milestoneId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onToggleMilestone,
  onEdit,
  onDelete,
  onArchive,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMilestones, setExpandedMilestones] = useState(false);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (targetDate: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const daysRemaining = getDaysRemaining(goal.targetDate);
  const isOverdue = daysRemaining < 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <ProgressCircle 
              progress={goal.progress} 
              color={goal.category.color}
            />
            <div>
              <h3 className="font-medium text-gray-900">{goal.title}</h3>
              <Badge text={goal.category.name} color={goal.category.color} />
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={16} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
                <button
                  onClick={() => {
                    onEdit();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit Goal
                </button>
                <button
                  onClick={() => {
                    onArchive();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Archive size={14} className="inline mr-2" />
                  Archive Goal
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <Trash2 size={14} className="inline mr-2" />
                  Delete Goal
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">{goal.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Target Date</p>
            <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
              {formatDate(goal.targetDate)}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500">Days Remaining</p>
            <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
              {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100">
        <button
          onClick={() => setExpandedMilestones(!expandedMilestones)}
          className="px-5 py-3 w-full text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {expandedMilestones ? 'Hide' : 'Show'} Milestones ({goal.milestones.filter(m => m.isCompleted).length}/{goal.milestones.length})
        </button>
        
        {expandedMilestones && (
          <div className="px-5 pb-4">
            <ul className="space-y-2">
              {goal.milestones.map((milestone: Milestone) => (
                <li key={milestone.id} className="flex items-start gap-2">
                  <button
                    onClick={() => onToggleMilestone(milestone.id)}
                    className="mt-0.5 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {milestone.isCompleted ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : (
                      
                      <Circle size={18} />
                    )}
                  </button>
                  <span 
                    className={`text-sm ${
                      milestone.isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'
                    }`}
                  >
                    {milestone.title}
                    {milestone.dueDate && (
                      <span className="text-xs text-gray-500 ml-2">
                        by {formatDate(milestone.dueDate)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            
            {goal.milestones.length === 0 && (
              <p className="text-sm text-gray-500 italic">No milestones created yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface GoalFormProps {
  goal?: Goal;
  categories: Category[];
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({
  goal,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    goal?.category || categories[0] || null
  );
  const [targetDate, setTargetDate] = useState(
    goal?.targetDate
      ? new Date(goal.targetDate).toISOString().split('T')[0]
      : (() => {
          const date = new Date();
          date.setDate(date.getDate() + 30);
          return date.toISOString().split('T')[0];
        })()
  );
  const [milestones, setMilestones] = useState<Omit<Milestone, 'id'>[]>(
    goal?.milestones.map(({ id, ...rest }) => rest) || []
  );
  const [newMilestone, setNewMilestone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !selectedCategory) {
      return;
    }
    
    const formData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      targetDate: new Date(targetDate),
      progress: goal?.progress || 0,
      milestones: milestones.map((milestone, index) => ({
        ...milestone,
        id: goal?.milestones[index]?.id || `temp-${index}`,
      })),
      isArchived: goal?.isArchived || false,
    };
    
    onSubmit(formData);
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([
        ...milestones,
        { title: newMilestone.trim(), isCompleted: false },
      ]);
      setNewMilestone('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title*
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What do you want to achieve?"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your goal in more detail..."
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                      selectedCategory?.id === category.id
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{
                      borderColor: selectedCategory?.id === category.id ? category.color : '',
                      backgroundColor: selectedCategory?.id === category.id ? `${category.color}10` : '',
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
                Target Date*
              </label>
              <div className="relative">
                <input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Milestones
              </label>
              
              <ul className="mb-3 space-y-2">
                {milestones.map((milestone, index) => (
                  <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">{milestone.title}</span>
                    <button
                      type="button"
                      onClick={() => setMilestones(milestones.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Remove milestone"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
                
                {milestones.length === 0 && (
                  <li className="text-sm text-gray-500 italic p-2">
                    No milestones added yet. Break your goal into smaller steps.
                  </li>
                )}
              </ul>
              
              <div className="flex">
                <input
                  type="text"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMilestone();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-200"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !selectedCategory}
            >
              {goal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GoalCalendarViewProps {
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
}

const GoalCalendarView: React.FC<GoalCalendarViewProps> = ({ goals, onSelectGoal }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<Date | null>>([]);
  const [goalsMap, setGoalsMap] = useState<Record<string, Goal[]>>({});

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: Array<Date | null> = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }
    
    setCalendarDays(days);

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
  }, [currentMonth, goals]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
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
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setCurrentMonth(newMonth);
            }}
            icon={<ChevronLeft size={14} />}
            aria-label="Previous month"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setCurrentMonth(newMonth);
            }}
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
                  {goalsMap[formatDateKey(date)]?.map(goal => (
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

// Main App Component
const GoalTrackerApp: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [categories] = useState<Category[]>(defaultCategories);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Goal | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Goal | null>(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completedGoal, setCompletedGoal] = useState<Goal | null>(null);
  
  const activeGoals = goals.filter(goal => !goal.isArchived);
  
  const handleAddGoal = () => {
    setEditingGoal(null);
    setShowGoalForm(true);
  };
  
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalForm(true);
  };
  
  const handleSubmitGoal = (formData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingGoal) {
      setGoals(goals.map(g => 
        g.id === editingGoal.id 
          ? { ...g, ...formData, updatedAt: new Date() }
          : g
      ));
    } else {
      const newGoal: Goal = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setGoals([...goals, newGoal]);
    }
    setShowGoalForm(false);
    setEditingGoal(null);
  };
  
  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const updatedMilestones = goal.milestones.map(milestone => 
        milestone.id === milestoneId 
          ? { ...milestone, isCompleted: !milestone.isCompleted }
          : milestone
      );
      
      const totalMilestones = updatedMilestones.length;
      const completedMilestones = updatedMilestones.filter(m => m.isCompleted).length;
      const newProgress = totalMilestones > 0 
        ? Math.round((completedMilestones / totalMilestones) * 100) 
        : goal.progress;
      
      const updatedGoal = {
        ...goal,
        milestones: updatedMilestones,
        progress: newProgress,
        updatedAt: new Date(),
      };
      
      if (newProgress === 100 && goal.progress !== 100) {
        setCompletedGoal(updatedGoal);
        setShowCompletionAnimation(true);
        setTimeout(() => setShowCompletionAnimation(false), 3000);
      }
      
      return updatedGoal;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddGoal={handleAddGoal} 
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <main className="container mx-auto px-4 pb-12 pt-24">
        <section className="mb-8">
          <Dashboard goals={goals} categories={categories} />
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {viewMode === 'calendar' ? (
              <GoalCalendarView 
                goals={activeGoals} 
                onSelectGoal={handleEditGoal} 
              />
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {activeGoals.length > 0 ? (
                  activeGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onToggleMilestone={(milestoneId) => handleToggleMilestone(goal.id, milestoneId)}
                      onEdit={() => handleEditGoal(goal)}
                      onDelete={() => setConfirmDelete(goal)}
                      onArchive={() => setConfirmArchive(goal)}
                    />
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Sparkles size={24} className="text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No goals yet</h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Create your first goal to start tracking your progress
                      </p>
                      <Button
                        onClick={handleAddGoal}
                        icon={<Plus size={16} />}
                      >
                        Create Goal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Category Performance</h2>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {categories.map(category => {
                  const categoryGoals = goals.filter(
                    goal => goal.category.id === category.id && !goal.isArchived
                  );
                  
                  const stats = {
                    count: categoryGoals.length,
                    avgProgress: categoryGoals.length > 0
                      ? Math.round(
                          categoryGoals.reduce((sum, goal) => sum + goal.progress, 0) / 
                          categoryGoals.length
                        )
                      : 0,
                    completed: categoryGoals.filter(goal => goal.progress === 100).length,
                    inProgress: categoryGoals.filter(goal => goal.progress > 0 && goal.progress < 100).length,
                    notStarted: categoryGoals.filter(goal => goal.progress === 0).length,
                  };
                  
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
          </div>
        </div>
      </main>
      
      {showGoalForm && (
        <GoalForm
          goal={editingGoal || undefined}
          categories={categories}
          onSubmit={handleSubmitGoal}
          onCancel={() => {
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
        />
      )}
      
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Goal"
          message={`Are you sure you want to delete "${confirmDelete.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={() => {
            setGoals(goals.filter(g => g.id !== confirmDelete.id));
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      
      {confirmArchive && (
        <ConfirmDialog
          title="Archive Goal"
          message={`Are you sure you want to archive "${confirmArchive.title}"? You can still view it in your archives.`}
          confirmText="Archive"
          onConfirm={() => {
            setGoals(goals.map(g => 
              g.id === confirmArchive.id 
                ? { ...g, isArchived: true, updatedAt: new Date() }
                : g
            ));
            setConfirmArchive(null);
          }}
          onCancel={() => setConfirmArchive(null)}
        />
      )}
      
      {showCompletionAnimation && completedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative">
            <div className="celebration-animation">
              <div className="text-center bg-white rounded-lg px-8 py-10 shadow-2xl">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">Goal Completed!</h3>
                <p className="text-lg mb-1">{completedGoal.title}</p>
                <p className="text-sm text-gray-500">Congratulations on your achievement!</p>
              </div>
            </div>
            <div className="celebration-confetti"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return <GoalTrackerApp />;
};

export default App;