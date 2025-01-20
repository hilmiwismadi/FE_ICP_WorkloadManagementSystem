"use client"

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import TaskTimeline from "@/components/organisms/tasks-list-calendar";
import TaskListTimeline from "@/components/organisms/TasklistTimeline";
import { Task } from "@/components/organisms/types/tasks";

export default function TaskLists() {
  // Add shared state for selected task
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Handler for task selection
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div className="flex h-screen bg-stale-50">
      <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="w-[65vw] flex-1  h-screen ml-[0.417vw] py-[1vw]  space-y-[1.25vw]">
            <TaskTimeline 
              selectedTask={selectedTask}
              onTaskSelect={handleTaskSelect}
            />
          </div>
          <div className="w-[15vw]  h-full ml-[0.417vw] py-[1vw] space-y-[1.25vw]">
            <TaskListTimeline onTaskSelect={handleTaskSelect}/>
          </div>
        </div>
    </div>
  );
}