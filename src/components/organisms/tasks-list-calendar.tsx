"use client";

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
} from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Task } from "./types/tasks";

// Update the component props
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

  // Get color based on workload and urgency
  const getTaskColor = (workload: string, urgency: string): string => {
    if (urgency === "critical") return "bg-red-500";
    if (urgency === "high") return "bg-orange-500";
    if (workload === "high") return "bg-yellow-500";
    if (workload === "medium") return "bg-blue-500";
    return "bg-green-500";
  };

  const handleStatusChange = (taskId: string, checked: boolean) => {
    // Use proper case directly
    const newStatus: "Ongoing" | "Done" | "Approved" = checked
      ? "Done"
      : "Ongoing";

    // Update local tasks
    const updatedTasks = localTasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setLocalTasks(updatedTasks);

    // Update selected task
    if (selectedTask && selectedTask.id === taskId) {
      onTaskSelect({ ...selectedTask, status: newStatus });
    }
  };

  // Calculate dates for view
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

  // Navigation handlers
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

  // Filter tasks based on status first
  const filteredTasks = tasks.filter((task) =>
    statusFilter === "all" ? true : task.status === statusFilter
  );

  // Then filter by date range
  const visibleTasks = filteredTasks.filter((task) => {
    const taskStart = task.startDate;
    const taskEnd = task.endDate;
    const viewStart = days[0];
    const viewEnd = days[days.length - 1];
    return taskStart <= viewEnd && taskEnd >= viewStart;
  });

  return (
    <div className="p-[1vw] space-y-[1vh] w-full">
      {/* Controls */}
      <div className="flex justify-between items-center ">
        <div className="space-x-2 ">
          <button
            className={`px-[1vw] py-[0.4vh] rounded text-[0.8vw]  transition-transform transform hover:scale-[0.98] hover:shadow-lg  ${
              viewMode === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-[1vw] py-[0.4vh] rounded text-[0.8vw]  transition-transform transform hover:scale-[0.98] hover:shadow-lg ${
              viewMode === "weekly" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("weekly")}
          >
            Weekly
          </button>
        </div>
        <div className="flex items-center space-x-4 scale-[0.8] ">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto w-full bg-gray-50 px-[0.5vw] rounded-lg ">
        <div className="w-full ">
          {/* Date Headers */}
          <div
            className={`grid gap-px  w-full `}
            style={{
              gridTemplateColumns: `repeat(${days.length}, minmax(30px, 1fr))`,
            }}
          >
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className="p-1 text-sm text-center bg-white border border-l rounded-lg "
              >
                {format(day, "d")}
              </div>
            ))}
          </div>

          {/* Tasks Timeline */}
          <div className="relative min-h-[20vw] bg-gray-50 w-full px-[1vw]">
            {visibleTasks.map((task, index) => {
              const startDate = task.startDate;
              const endDate = task.endDate;

              // Calculate position and width
              let startPosition = 0;
              let endPosition = days.length;

              // Adjust start position if task starts before view
              if (startDate >= days[0]) {
                startPosition = days.findIndex(
                  (day) =>
                    format(day, "yyyy-MM-dd") ===
                    format(startDate, "yyyy-MM-dd")
                );
              }

              // Adjust end position if task ends after view
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
                  className={`absolute  cursor-pointer transition-transform transform hover:scale-[0.98] hover:shadow-lg ${getTaskColor(
                    task.workload,
                    task.urgency
                  )} rounded p-1 text-white text-[0.8vw] truncate`}
                  style={{
                    left: `${(startPosition / days.length) * 100}%`,
                    width: `${width}%`,
                    top: `${index * 2 + 1}vw`,
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
