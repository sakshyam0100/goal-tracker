import React from 'react';

interface BadgeProps {
  text: string;
  color?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  text, 
  color = '#3B82F6',
  className = '' 
}) => {
  // Generate a lighter background color based on the main color
  const bgColor = `bg-opacity-15 bg-[${color}]`;
  const textColor = `text-[${color}]`;
  
  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}
      style={{ 
        backgroundColor: `${color}15`, // 15% opacity
        color: color 
      }}
    >
      {text}
    </span>
  );
};