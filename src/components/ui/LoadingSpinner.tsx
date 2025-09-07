import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const variantClasses = {
  default: 'border-gray-300 border-t-gray-600',
  primary: 'border-blue-200 border-t-blue-600',
  secondary: 'border-green-200 border-t-green-600'
};

export default function LoadingSpinner({ 
  size = 'md', 
  className, 
  text,
  variant = 'default'
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div 
        className={cn(
          'animate-spin rounded-full border-2',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Wrapper component for full screen loading
export function FullScreenLoader({ 
  text = 'Đang tải...', 
  variant = 'primary' 
}: { 
  text?: string; 
  variant?: 'default' | 'primary' | 'secondary';
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" variant={variant} text={text} />
      </div>
    </div>
  );
}

// Inline loading component
export function InlineLoader({ 
  text = 'Đang tải...', 
  size = 'sm',
  variant = 'default'
}: { 
  text?: string; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
}) {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <LoadingSpinner size={size} variant={variant} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}