import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const tasksPerPage = 5;

  const getTaskColor = (mcda: number): string => {
    const normalizedMCDA = mcda * 100;

    if (normalizedMCDA >= 80) return "bg-red-700";
    if (normalizedMCDA >= 60) return "bg-orange-500";
    if (normalizedMCDA >= 40) return "bg-yellow-400";
    if (normalizedMCDA >= 20) return "bg-green-500";
    return "bg-blue-400";
  };

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

  const totalPages = Math.ceil(visibleTasks.length / tasksPerPage);
  const paginatedTasks = visibleTasks.slice(
    currentPage * tasksPerPage,
    (currentPage + 1) * tasksPerPage
  );

  const handlePageUp = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handlePageDown = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const todayIndex = days.findIndex((day) => isToday(day));

  return (
    <div className="flex flex-row items-center w-full">
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
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px)",
              backgroundSize: "2rem 100%",
            }}
          >
            {todayIndex !== -1 && (
              <div
                className="absolute top-0 bottom-0 bg-blue-50/50 border-x border-blue-200"
                style={{
                  left: `${(todayIndex / days.length) * 100}%`,
                  width: `${(1 / days.length) * 100}%`,
                }}
              />
            )}
          </div>

          <div
            className={
              viewMode === "weekly"
                ? "max-w-[70vw] relative z-20"
                : "w-[65.5vw] relative z-20"
            }
          >
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
                  ${isToday(day) ? "bg-blue-100 font-bold" : "bg-gray-50"}
                  ${index === 0 ? "rounded-bl" : ""}
                  ${index === days.length - 1 ? "rounded-br" : ""}`}
                >
                  <div
                    className={`${
                      isToday(day) ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div
                    className={`text-[0.5rem] text-gray-500 ${
                      isToday(day) ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {format(day, "EEE")}
                  </div>
                </div>
              ))}
            </div>

            {/* Tasks Timeline with Pagination */}
            <div className="flex">
              <div
                className="relative bg-white w-full"
                style={{
                  height: "12vw",
                }}
              >
                {/* Horizontal Swimlanes */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
                    backgroundSize: "100% 2rem",
                  }}
                />

                {paginatedTasks.map((task, index) => {
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
                      format(day, "yyyy-MM-dd") ===
                      format(endDate, "yyyy-MM-dd")
                  );
                  if (endIdx !== -1) {
                    endPosition = endIdx + 1;
                  }

                  const width =
                    ((endPosition - startPosition) / days.length) * 100;

                  return (
                    <div
                      key={task.id}
                      className={`absolute cursor-pointer transition-all ${getTaskColor(
                        task.mcda
                      )} rounded p-1 text-white text-[0.6vw] truncate`}
                      style={{
                        left: `${(startPosition / days.length) * 100}%`,
                        width: `${width}%`,
                        top: `${index * 2 + 0.5}vw`,
                        minHeight: "1.5vw",
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
        {/* Pagination Controls */}
        <div className="flex flex-row space-x-[0.4vw] items-center justify-end">
          <div className="text-[0.8vw] font-medium text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex flex-col">
            <button
              onClick={handlePageUp}
              disabled={currentPage === 0}
              className={`rounded-[0.3vw] transition ${
                currentPage === 0
                  ? "text-gray-200 cursor-not-allowed"
                  : "hover:text-gray-300"
              }`}
            >
              <ChevronUp size={15} />
            </button>
            <button
              onClick={handlePageDown}
              disabled={currentPage >= totalPages - 1}
              className={`rounded-[0.3vw] transition ${
                currentPage >= totalPages - 1
                  ? "text-gray-200 cursor-not-allowed"
                  : "hover:text-gray-300"
              }`}
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTimeline;
