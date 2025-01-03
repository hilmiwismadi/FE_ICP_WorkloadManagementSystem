import React from 'react';

const WorkloadStatusBar = ({ value }: { value: number }) => {
  // Convert value (0-10) to percentage (0-100)
  const percentage = (value / 10) * 100;
  
  // Determine color based on workload percentage
  const getColor = () => {
    if (percentage >= 70) return 'bg-red-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Handle special case for 0
  if (value === 0) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full" />
        <span className="text-gray-500 text-sm">Idle</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default WorkloadStatusBar;