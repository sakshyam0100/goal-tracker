import React, { useState } from 'react';
import { MoreVertical, CheckCircle2, Circle, Trash2, Archive } from 'lucide-react';
import { Goal, Milestone } from '../types';
import { ProgressCircle } from './ui/ProgressCircle';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface GoalCardProps {
  goal: Goal;
  onToggleMilestone: (milestoneId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onToggleMilestone,
  onEdit,
  onDelete,
  onArchive,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMilestones, setExpandedMilestones] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMilestones = () => {
    setExpandedMilestones(!expandedMilestones);
  };

  // Format date to a readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate days remaining
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
              onClick={toggleMenu}
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
          onClick={toggleMilestones}
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