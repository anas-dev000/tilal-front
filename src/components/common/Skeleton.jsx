import React from 'react';

const Skeleton = ({ 
  className = '', 
  variant = 'rectangle', // 'rectangle', 'circle', 'text'
  width, 
  height 
}) => {
  const baseClass = "animate-pulse bg-gray-200";
  
  const variants = {
    rectangle: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4 mb-2"
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? undefined : '100%')
  };

  return (
    <div 
      className={`${baseClass} ${variants[variant]} ${className}`}
      style={style}
    />
  );
};

// Specialized Skeletons for common UI patterns
export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="circle" width="48px" height="48px" />
      <div className="flex-1">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full space-y-4">
    {/* Table Header */}
    <div className="flex gap-4 p-4 border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="rectangle" height="20px" />
      ))}
    </div>
    {/* Table Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-4 items-center">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="rectangle" height="16px" />
        ))}
      </div>
    ))}
  </div>
);

export const TaskDetailSkeleton = () => (
  <div className="space-y-6">
    {/* Header Card */}
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <Skeleton variant="text" width="30%" height="32px" />
      <Skeleton variant="text" width="60%" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64">
          <Skeleton variant="rectangle" height="100%" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96">
          <Skeleton variant="rectangle" height="100%" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-48">
          <Skeleton variant="rectangle" height="100%" />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
