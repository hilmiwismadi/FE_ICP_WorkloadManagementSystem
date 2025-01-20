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
}

const TaskTimeline = ({ selectedTask, onTaskSelect, tasks }: TaskTimelineProps) => {
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
    // Determine new status with the correct type
    const newStatus: "ongoing" | "done" | "approved" = checked ? "done" : "ongoing";
  
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

  // Filter tasks that are visible in current view
  const visibleTasks = localTasks.filter((task) => {
    const taskStart = task.startDate;
    const taskEnd = task.endDate;
    const viewStart = days[0];
    const viewEnd = days[days.length - 1];
    return taskStart <= viewEnd && taskEnd >= viewStart;
  });

  return (
    <div className="p-4 space-y-4 w-full">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <button
            className={`px-4 py-2 rounded ${
              viewMode === "weekly" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-4 py-2 rounded ${
              viewMode === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("monthly")}
          >
            Monthly
          </button>
        </div>
        <div className="flex items-center space-x-4">
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
      <div className="overflow-x-auto w-full bg-gray-50">
        <div className="w-full ">
          {/* Date Headers */}
          <div
            className={`grid gap-px bg-gray-200 w-full border border-l`}
            style={{
              gridTemplateColumns: `repeat(${days.length}, minmax(30px, 1fr))`,
            }}
          >
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className="p-1 text-sm text-center bg-white "
              >
                {format(day, "d")}
              </div>
            ))}
          </div>

          {/* Tasks Timeline */}
          <div className="relative min-h-[20vw] bg-gray-50 w-full">
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
                  className={`absolute cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg ${getTaskColor(
                    task.workload,
                    task.urgency
                  )} rounded p-1 text-white text-sm truncate`}
                  style={{
                    left: `${(startPosition / days.length) * 100}%`,
                    width: `${width}%`,
                    top: `${index * 40 + 10}px`,
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

      {/* Task Details */}
      {/* {selectedTask && (
        <div className="p-[1vw] border rounded-lg bg-white w-full">
          <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
          <div className="mt-2 text-gray-600 space-y-2">
            <p>
              Duration: {format(selectedTask.startDate, "MMM d")} -{" "}
              {format(selectedTask.endDate, "MMM d")}
            </p>
            <p>Workload: {selectedTask.workload}</p>
            <p>Urgency: {selectedTask.urgency}</p>
            <p>
              Status: <span className="capitalize">{selectedTask.status}</span>
            </p>
            <div className="flex items-center space-x-2">
              <span>Progress:</span>
              <Switch
                id={`task-switch-${selectedTask.id}`}
                checked={selectedTask.status === "done"}
                onCheckedChange={(checked) => handleStatusChange(selectedTask.id, checked)}
              />
              <span>{selectedTask.status === "done" ? "Done" : "Ongoing"}</span>
            </div>
            <p className="mt-2">{selectedTask.description}</p>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default TaskTimeline;
