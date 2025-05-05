import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Goal, Category, Milestone } from '../types';
import { Button } from './ui/Button';

interface GoalFormProps {
  goal?: Goal;
  categories: Category[];
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({
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
      : getDefaultTargetDate()
  );
  const [milestones, setMilestones] = useState<Omit<Milestone, 'id'>[]>(
    goal?.milestones.map(({ id, ...rest }) => rest) || []
  );
  const [newMilestone, setNewMilestone] = useState('');

  function getDefaultTargetDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date.toISOString().split('T')[0];
  }

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
        id: goal?.milestones[index]?.id || `temp-${index}`, // Will be replaced with real ID in context
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

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
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
                <CalendarIcon size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                      onClick={() => removeMilestone(index)}
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