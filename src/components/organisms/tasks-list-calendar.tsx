import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addDays,
  addMonths,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
  subWeeks,
  addWeeks,
  isToday,
} from "date-fns";
import { Task } from "./types/tasks";

interface TaskTimelineProps {
  selectedTask: Task | null;
  onTaskSelect: (task: Task) => void;
  tasks: Task[];
  statusFilter: string;
}

const TaskTimeline = ({
  selectedTask,
  onTaskSelect,
  tasks,
  statusFilter,
}: TaskTimelineProps) => {
  const [viewMode, setViewMode] = useState("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  const getTaskColor = (mcda: number): string => {
    const normalizedMCDA = mcda * 100; // Convert to percentage
  
    if (normalizedMCDA >= 80) return "bg-red-700"; // 80-100 (Critical)
    if (normalizedMCDA >= 60) return "bg-orange-500"; // 60-79 (High)
    if (normalizedMCDA >= 40) return "bg-yellow-400"; // 40-59 (Medium)
    if (normalizedMCDA >= 20) return "bg-green-500"; // 20-39 (Low)
    return "bg-blue-400"; // 0-19 (Very Low)
  };
  

  console.log(tasks);

  const getDaysForView = () => {
    const start =
      viewMode === "weekly"
        ? startOfWeek(currentDate)
        : startOfMonth(currentDate);
    const end =
      viewMode === "weekly"
        ? addDays(start, 6)
        : addDays(startOfMonth(addMonths(currentDate, 1)), -1);

    return eachDayOfInterval({ start, end });
  };

  const handlePrevious = () => {
    if (viewMode === "weekly") {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addMonths(prev, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === "weekly") {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  const days = getDaysForView();

  const filteredTasks = tasks.filter((task) =>
    statusFilter === "all" ? true : task.status === statusFilter
  );

  const visibleTasks = filteredTasks.filter((task) => {
    const taskStart = task.startDate;
    const taskEnd = task.endDate;
    const viewStart = days[0];
    const viewEnd = days[days.length - 1];
    return taskStart <= viewEnd && taskEnd >= viewStart;
  });

  const todayIndex = days.findIndex(day => isToday(day));

  return (
    <div className="p-[1.25vw] space-y-2 w-full bg-white shadow-sm rounded-lg border">
      {/* Controls */}
      <div className="flex justify-between items-center border-b pb-2">
        <div className="space-x-1 text-xs">
          <button
            className={`px-2 py-1 rounded transition-all ${
              viewMode === "monthly" 
                ? "bg-blue-700 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setViewMode("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-2 py-1 rounded transition-all ${
              viewMode === "weekly" 
                ? "bg-blue-700 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setViewMode("weekly")}
          >
            Weekly
          </button>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={handlePrevious}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="font-medium text-gray-800">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button
            onClick={handleNext}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto w-full relative">
        {/* Vertical Grid Swimlanes with Today Highlight */}
        <div 
          className="absolute inset-0 pointer-events-none flex"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '2rem 100%',
          }}
        >
          {/* Today Highlight */}
          {todayIndex !== -1 && (
            <div 
              className="absolute top-0 bottom-0 bg-blue-50/50 border-x border-blue-200"
              style={{
                left: `${(todayIndex / days.length) * 100}%`,
                width: `${(1 / days.length) * 100}%`
              }}
            />
          )}
        </div>

        <div className="w-[65.5vw] relative z-20">
          {/* Date Headers */}
          <div
            className="grid gap-0 w-full border-b"
            style={{
              gridTemplateColumns: `repeat(${days.length}, minmax(2vw, 1fr))`,
            }}
          >
            {days.map((day, index) => (
              <div
                key={day.toISOString()}
                className={`p-[0.3vw] text-[0.6rem] text-center 
                  ${isToday(day) ? 'bg-blue-100 font-bold' : 'bg-gray-50'}
                  ${index === 0 ? 'rounded-bl' : ''}
                  ${index === days.length - 1 ? 'rounded-br' : ''}`}
              >
                <div className={`${isToday(day) ? 'text-blue-700' : 'text-gray-800'}`}>
                  {format(day, "d")}
                </div>
                <div className={`text-[0.5rem] text-gray-500 ${isToday(day) ? 'text-blue-700' : 'text-gray-800'}`}>
                  {format(day, "EEE")}
                </div>
              </div>
            ))}
          </div>

          {/* Tasks Timeline with Horizontal Swimlanes */}
          <div 
            className="relative bg-white w-full"
            style={{ 
              minHeight: `${Math.max(visibleTasks.length * 3, 17)}vw`
            }}
          >
            {/* Horizontal Swimlanes */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '100% 2rem',
              }}
            />

            {visibleTasks.map((task, index) => {
              const startDate = task.startDate;
              const endDate = task.endDate;

              let startPosition = 0;
              let endPosition = days.length;

              if (startDate >= days[0]) {
                startPosition = days.findIndex(
                  (day) =>
                    format(day, "yyyy-MM-dd") ===
                    format(startDate, "yyyy-MM-dd")
                );
              }

              const endIdx = days.findIndex(
                (day) =>
                  format(day, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd")
              );
              if (endIdx !== -1) {
                endPosition = endIdx + 1;
              }

              const width = ((endPosition - startPosition) / days.length) * 100;

              return (
                <div
                  key={task.id}
                  className={`absolute cursor-pointer transition-all ${getTaskColor(
                    task.mcda
                  )} rounded p-1 text-white text-[0.6rem] truncate`}
                  style={{
                    left: `${(startPosition / days.length) * 100}%`,
                    width: `${width}%`,
                    top: `${index * 2 + 0.5}vw`,
                    minHeight: '1.5vw'
                  }}
                  onClick={() => onTaskSelect(task)}
                >
                  {task.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTimeline;