import React, { useState, useEffect } from 'react';
import { Menu, Plus, X, Calendar, LayoutGrid, List } from 'lucide-react';
import { Button } from './ui/Button';
import { ViewMode } from '../types';

interface HeaderProps {
  onAddGoal: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddGoal, viewMode, setViewMode }) => {
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const headerClass = `fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${
    isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
  }`;

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            GoalTracker
          </h1>
        </div>

        {/* Desktop view controls */}
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

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={toggleMobileMenu}
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