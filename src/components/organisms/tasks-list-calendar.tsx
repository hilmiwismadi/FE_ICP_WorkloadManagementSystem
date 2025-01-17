"use client"

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, addMonths, startOfWeek, startOfMonth, eachDayOfInterval, subWeeks, addWeeks } from 'date-fns';

// Expanded dummy data with more tasks
const dummyTasks = [
  {
    id: 1,
    title: "API Integration",
    startDate: new Date(2025, 0, 15),
    endDate: new Date(2025, 0, 21),
    workload: "high",
    urgency: "critical",
    description: "Integrate payment gateway API with error handling and security measures",
    priority: 6.5
  },
  {
    id: 2,
    title: "Database Migration",
    startDate: new Date(2025, 0, 12),
    endDate: new Date(2025, 0, 18),
    workload: "medium",
    urgency: "normal",
    description: "Migrate user data to new schema with zero downtime strategy",
    priority: 6.5
  },
  {
    id: 3,
    title: "UI Redesign",
    startDate: new Date(2025, 0, 13),
    endDate: new Date(2025, 0, 19),
    workload: "high",
    urgency: "high",
    description: "Implement new design system across all main components",
    priority: 6.5
  },
  {
    id: 4,
    title: "Performance Optimization",
    startDate: new Date(2025, 0, 14),
    endDate: new Date(2025, 0, 20),
    workload: "medium",
    urgency: "normal",
    description: "Optimize application performance and reduce loading times",
    priority: 6.5
  },
  {
    id: 5,
    title: "Security Audit",
    startDate: new Date(2025, 0, 16),
    endDate: new Date(2025, 0, 22),
    workload: "high",
    urgency: "critical",
    description: "Conduct comprehensive security audit and implement fixes",
    priority: 6.5
  },
  {
    id: 6,
    title: "Documentation Update",
    startDate: new Date(2025, 0, 17),
    endDate: new Date(2025, 0, 23),
    workload: "low",
    urgency: "low",
    description: "Update technical documentation and API references",
    priority: 6.5
  },
  {
    id: 7,
    title: "Testing Automation",
    startDate: new Date(2025, 0, 18),
    endDate: new Date(2025, 0, 24),
    workload: "medium",
    urgency: "high",
    description: "Implement automated testing suite for core functionalities",
    priority: 6.5
  }
];

const TaskTimeline = () => {
  const [viewMode, setViewMode] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);

  // Get color based on workload and urgency
  const getTaskColor = (workload, urgency) => {
    if (urgency === 'critical') return 'bg-red-500';
    if (urgency === 'high') return 'bg-orange-500';
    if (workload === 'high') return 'bg-yellow-500';
    if (workload === 'medium') return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Calculate dates for view
  const getDaysForView = () => {
    const start = viewMode === 'weekly' 
      ? startOfWeek(currentDate) 
      : startOfMonth(currentDate);
    const end = viewMode === 'weekly'
      ? addDays(start, 6)
      : addDays(startOfMonth(addMonths(currentDate, 1)), -1);
    
    return eachDayOfInterval({ start, end });
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === 'weekly') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'weekly') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const days = getDaysForView();

  // Filter tasks that are visible in current view
  const visibleTasks = dummyTasks.filter(task => {
    const taskStart = task.startDate;
    const taskEnd = task.endDate;
    const viewStart = days[0];
    const viewEnd = days[days.length - 1];

    return (
      (taskStart <= viewEnd && taskEnd >= viewStart) // Task overlaps with view period
    );
  });

  return (
    <div className="p-4 space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <button 
            className={`px-4 py-2 rounded ${viewMode === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`px-4 py-2 rounded ${viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('monthly')}
          >
            Monthly
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevious} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full border rounded-lg">
          {/* Date Headers */}
          <div className={`grid gap-px bg-gray-200`} 
               style={{ gridTemplateColumns: `repeat(${days.length}, minmax(30px, 1fr))` }}>
            {days.map((day) => (
              <div 
                key={day.toISOString()} 
                className="p-1 text-sm text-center bg-white"
              >
                {format(day, 'd')}
              </div>
            ))}
          </div>

          {/* Tasks Timeline */}
          <div className="relative min-h-[300px] bg-gray-50">
            {visibleTasks.map((task, index) => {
              const startDate = task.startDate;
              const endDate = task.endDate;
              
              // Calculate position and width
              let startPosition = 0;
              let endPosition = days.length;
              
              // Adjust start position if task starts before view
              if (startDate >= days[0]) {
                startPosition = days.findIndex(day => 
                  format(day, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd')
                );
              }
              
              // Adjust end position if task ends after view
              const endIdx = days.findIndex(day => 
                format(day, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')
              );
              if (endIdx !== -1) {
                endPosition = endIdx + 1;
              }
              
              const width = ((endPosition - startPosition) / days.length) * 100;

              return (
                <div
                  key={task.id}
                  className={`absolute cursor-pointer ${getTaskColor(task.workload, task.urgency)} rounded p-1 text-white text-sm truncate`}
                  style={{
                    left: `${(startPosition / days.length) * 100}%`,
                    width: `${width}%`,
                    top: `${index * 40 + 10}px`,
                  }}
                  onClick={() => setSelectedTask(task)}
                >
                  {task.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Details */}
      {selectedTask && (
        <div className="mt-4 p-4 border rounded-lg bg-white">
          <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
          <div className="mt-2 text-gray-600">
            <p>Duration: {format(selectedTask.startDate, 'MMM d')} - {format(selectedTask.endDate, 'MMM d')}</p>
            <p>Workload: {selectedTask.workload}</p>
            <p>Urgency: {selectedTask.urgency}</p>
            <p className="mt-2">{selectedTask.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTimeline;