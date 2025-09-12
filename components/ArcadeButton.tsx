import React from 'react';
import { soundManager } from './soundManager';

interface ArcadeButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'gray' | 'purple';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ArcadeButton: React.FC<ArcadeButtonProps> = ({ onClick, children, color = 'gray', className = '', size = 'md' }) => {
  const colorClasses = {
    blue: 'bg-blue-600 border-blue-800 hover:bg-blue-500',
    green: 'bg-green-600 border-green-800 hover:bg-green-500',
    red: 'bg-red-600 border-red-800 hover:bg-red-500',
    purple: 'bg-purple-600 border-purple-800 hover:bg-purple-500',
    gray: 'bg-gray-600 border-gray-800 hover:bg-gray-500',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1 border-b-4 active:border-b-2',
    md: 'text-lg px-2 py-3 border-b-8 active:border-b-4',
    lg: 'text-xl px-8 py-4 border-b-8 active:border-b-4',
  };

  const handleClick = () => {
    soundManager.play('buttonClick');
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`font-arcade text-white rounded-lg ${colorClasses[color]} ${sizeClasses[size]} transform transition-transform hover:scale-105 active:translate-y-1 focus:outline-none focus:ring-4 focus:ring-yellow-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default ArcadeButton;
