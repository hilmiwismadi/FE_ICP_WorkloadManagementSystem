import React from 'react';

const WorkloadStatusBar = ({ value }: { value: number }) => {
  // Convert value (0-10) to percentage (0-100)
  const percentage = Math.round((value / 10.7) * 100);

  
  // Determine color based on workload percentage
  const getColor = () => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Handle special case for 0
  if (value === 0) {
    return (
      <div className="flex items-center space-x-[0.417vw]">
        <div className="w-[7vw] h-[0.5vw] bg-gray-200 rounded-full" />
        <span className="text-gray-500 text-[1vw]">Idle</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-[0.5vw]">
      <div className="w-[7vw] h-[0.5vw] bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default WorkloadStatusBar;