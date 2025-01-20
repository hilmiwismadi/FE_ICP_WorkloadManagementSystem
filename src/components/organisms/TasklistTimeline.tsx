import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task} from "./types/tasks";

interface TaskListTimelineProps {
  onTaskSelect: (task: Task) => void;
  tasks: Task[];
}

function getPriorityColor(priority: string) {
  const value = parseFloat(priority);
  if (value >= 7) return "bg-red-500";
  if (value >= 4) return "bg-yellow-500";
  return "bg-green-500";
}

export default function TaskListTimeline({
  onTaskSelect,
  tasks,
}: TaskListTimelineProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTasks = tasks.filter((task: Task) =>
    statusFilter === "all" ? true : task.status === statusFilter
  );

  return (
    <Card className="bg-[#0A1D56]">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <CardTitle className="text-white text-[1.25vw]">Task</CardTitle>
          <Select onValueChange={setStatusFilter} defaultValue="all">
            <SelectTrigger className="w-full text-white border-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[80vh] mr-[0.5vw] overflow-y-scroll scrollbar-thin scrollbar-thumb-white scrollbar-track-[#0A1D56]">
        <div className="space-y-[0.833vw] mt-[0.5vw] ">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="bg-white cursor-pointer hover:bg-gray-50 transform hover:scale-105 hover:shadow-lg"
              onClick={() => onTaskSelect(task)}
            >
              <CardContent className="p-[0.833vw] ">
                <div className="flex justify-between items-start relative">
                  <div className="space-y-[0.217vw]">
                    <h3 className="font-medium text-[0.8vw]">{task.title}</h3>
                    <p className="font-medium text-[0.7vw] text-gray-500">
                      {task.description}
                    </p>
                    <p className="text-[0.7vw] text-gray-500 capitalize">
                      Status: {task.status}
                    </p>
                  </div>
                  <div className="flex absolute -top-[1.2vw] -right-[1.5vw]">
                    <span
                      className={`${getPriorityColor(
                        task.priority
                      )} text-white text-[0.9vw] px-[0.417vw] py-[0.208vw] rounded-full bottom-0`}
                    > {task.priority} </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
