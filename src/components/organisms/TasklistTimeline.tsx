import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task } from "./types/tasks";

interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  tasks: Task[];
  statusFilter: string;
  onStatusFilter: (status: string) => void;
  teamFilter: string;
  onTeamFilter: (team: string) => void;
  isVisible?: boolean;
}

const getPriorityColor = (priority: string) => {
  const value = parseFloat(priority);
  if (value >= 7) return "bg-red-600";
  if (value >= 4) return "bg-amber-500";
  return "bg-emerald-500";
};

const getTaskSpanColor = (status: string) => {
  switch (status) {
    case "Ongoing":
      return "bg-amber-500";
    case "Done":
      return "bg-blue-800";
    case "Approved":
      return "bg-emerald-500";
    default:
      return "bg-gray-400";
  }
};

export default function CompactTaskList({
  onTaskSelect,
  tasks,
  statusFilter,
  onStatusFilter,
  teamFilter,
  onTeamFilter,
  isVisible = true,
}: TaskListProps) {
  const filteredTasks = tasks.filter(
    (task) =>
      (statusFilter === "all" || task.status === statusFilter) &&
      (teamFilter === "all" || task.team === teamFilter)
  );

  return (
    <Card className="w-full border-gray-200 shadow-md">
      <CardHeader className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col gap-[1vw] justify-between items-center">
          <div className={`w-full flex items-center ${!isVisible ? 'justify-between' : ''}`}>
            <div className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Task
            </div>
            {!isVisible && (
              <div>
                <Select onValueChange={onStatusFilter} value={statusFilter}>
                  <SelectTrigger className="w-[122.5px] gap-[0.5vw] h-8 text-xs border-gray-300 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Tasks
                    </SelectItem>
                    <SelectItem value="Ongoing" className="text-xs">
                      Ongoing
                    </SelectItem>
                    <SelectItem value="Done" className="text-xs">
                      Done
                    </SelectItem>
                    <SelectItem value="Approved" className="text-xs">
                      Approved
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {isVisible && (
            <div className="flex justify-between gap-[0.5vw] w-full">
              <div>
                <Select onValueChange={onTeamFilter} value={teamFilter}>
                  <SelectTrigger className="w-[122.5px] gap-[0.5vw] h-8 text-xs border-gray-300 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Filter Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Teams
                    </SelectItem>
                    <SelectItem value="Korporat 1" className="text-xs">
                      Korporat 1
                    </SelectItem>
                    <SelectItem value="Korporat 2" className="text-xs">
                      Korporat 2
                    </SelectItem>
                    <SelectItem value="Pelayanan Pelanggan" className="text-xs">
                      Pelayanan Pelanggan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select onValueChange={onStatusFilter} value={statusFilter}>
                  <SelectTrigger className="w-[122.5px] gap-[0.5vw] h-8 text-xs border-gray-300 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Tasks
                    </SelectItem>
                    <SelectItem value="Ongoing" className="text-xs">
                      Ongoing
                    </SelectItem>
                    <SelectItem value="Done" className="text-xs">
                      Done
                    </SelectItem>
                    <SelectItem value="Approved" className="text-xs">
                      Approved
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 h-[81vh] overflow-y-auto rounded-[0.3vw] scrollbar-hide scrollbar-thumb-transparent">
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="relative bg-white border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer transition-all duration-200 ease-in-out shadow-sm hover:shadow-md group"
              onClick={() => onTaskSelect(task)}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${getTaskSpanColor(
                  task.status
                )} rounded-t-md`}
              ></div>
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-grow pr-2">
                    <h3 className="text-xs font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-700 transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {task.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600 capitalize bg-gray-100 px-2 py-0.5 rounded">
                        {task.status}
                      </span>
                      <span
                        className={`${getPriorityColor(
                          task.priority
                        )} text-white text-[0.6rem] px-2 py-0.5 rounded-full font-bold`}
                      >
                        {task.workload}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}