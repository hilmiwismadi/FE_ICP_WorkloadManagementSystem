"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import TaskTimeline from "@/components/organisms/tasks-list-calendar";
import TaskListTimeline from "@/components/organisms/TasklistTimeline";
import { Task } from "@/components/organisms/types/tasks";
import { TaskDetails } from "@/components/organisms/TaskDetails";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import ProtectedRoute from "@/components/protected-route";
import { useParams } from "next/navigation";
import NoTasksNotification from "../NoTasksNotification";

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  email?: string;
  team?: string;
  skill?: string;
  phone?: string;
  current_Workload: number;
}

interface ApiTask {
  task_Id: string;
  title: string;
  type: string;
  description: string;
  status: string;
  priority: string;
  workload: number;
  start_Date: string;
  end_Date: string;
  user_Id: string;
  assigns?: Array<{
    employee_Id: string;
    employee: Employee;
  }>;
  team: string;
}

function convertApiTaskToTask(apiTask: ApiTask): Task {
  return {
    id: apiTask.task_Id,
    title: apiTask.title,
    startDate: new Date(apiTask.start_Date),
    endDate: new Date(apiTask.end_Date),
    workload: apiTask.workload.toString(),
    urgency:
      apiTask.priority.toLowerCase() === "high"
        ? "critical"
        : apiTask.priority.toLowerCase() === "medium"
        ? "high"
        : "normal",
    description: apiTask.description,
    priority: (
      parseInt(
        apiTask.priority === "High"
          ? "8"
          : apiTask.priority === "Medium"
          ? "5"
          : "2"
      ) + Math.random()
    ).toFixed(1),
    status: apiTask.status as "Ongoing" | "Done" | "Approved",
    team: apiTask.team,
  };
}

export default function PicRoadmap() {
  const params = useParams();

  // Use id instead of user_Id from params
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("Ongoing");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [showNoTasksModal, setShowNoTasksModal] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      if (!id) {
        setError("ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/user/read/${id}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );


        if (response.status === 404) {
          setTasks([]);
          setShowNoTasksModal(true);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }

        const data = await response.json();

        const apiTasks: ApiTask[] = Array.isArray(data.data)
          ? data.data
          : data.data || [];

        const convertedTasks = apiTasks.map(convertApiTaskToTask);

        setTasks(convertedTasks);
      } catch (error) {
        console.error("Error details:", error);
        if (error instanceof Error && error.message.includes("404")) {
          setTasks([]);
          setShowNoTasksModal(true);
        } else {
          setError(error instanceof Error ? error.message : "Failed to fetch tasks");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [id]); // Watch id instead of params

  // Early return for loading and error states
  if (!id) {
    return <LoadingScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error && error !== "404") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-200 scrollbar-hide scrollbar-thumb-transparent">
        <Sidebar />
        <div className="grid grid-cols-4 w-[80%] flex-grow overflow-auto scrollbar-hide scrollbar-thumb-transparent h-screen ml-[0.417vw] py-[1.25vw] px-[1.25vw] space-x-[1.25vw]">
          <div className="col-span-3 flex-grow overflow-auto h-full scrollbar-hide scrollbar-thumb-transparent">
            <div className="flex items-start justify-center space-y-[1.25vw]">
              <div className="w-full space-y-[1.25vw]">
                <TaskTimeline
                  selectedTask={selectedTask}
                  onTaskSelect={setSelectedTask}
                  tasks={tasks}
                  statusFilter={statusFilter}
                />
                <TaskDetails
                  selectedTask={selectedTask}
                  onStatusUpdate={(taskId, newStatus) => {
                    setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
                    if (selectedTask?.id === taskId) {
                      setSelectedTask(prev => (prev ? { ...prev, status: newStatus } : null));
                    }
                  }}
                  onClose={() => setSelectedTask(null)}
                  showStatusButtons={false}
                />
              </div>
            </div>
          </div>
          <div className="col-span-1 h-full max-w-[21.5vw]">
            <TaskListTimeline
              onTaskSelect={setSelectedTask}
              tasks={tasks}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
              teamFilter={teamFilter}
              onTeamFilter={setTeamFilter}
              isVisible={false}
            />
          </div>
        </div>
        <NoTasksNotification 
          isOpen={showNoTasksModal} 
          onClose={() => setShowNoTasksModal(false)} 
        />
      </div>
    </ProtectedRoute>
  );
}