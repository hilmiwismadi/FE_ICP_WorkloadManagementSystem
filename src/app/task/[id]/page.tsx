"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/organisms/SearchBarTask";
import ProfileHeader from "@/components/organisms/ProfileHeader";
import Sidebar from "@/components/sidebar";
import { DataTable } from "../data-table";
import BulkTaskModal from "../BulkTaskModal";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import ProtectedRoute from "@/components/protected-route";
import { jwtDecode } from "jwt-decode";
import { AnimatePresence } from "framer-motion";

interface TaskDetails {
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
  employee_Id: string;
}

interface Assignment {
  task_Id: string;
  employee_Id: string;
  task: TaskDetails;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  team: string;
  skill: string;
  role: string;
  currentWorkload: number;
  startDate: string;
  avatar?: string;
}

interface ApiResponse {
  data: {
    employee_Id: string;
    name: string;
    image: string;
    phone: string;
    team: string;
    skill: string;
    current_Workload: number;
    start_Date: string;
    assigns: Assignment[];
  };
  error: null | string;
}

export default function TaskPageId() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<TaskDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get<ApiResponse>(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${id}`
        );

        const result = response.data;

        if (result.error) {
          setError(result.error);
          console.error("API Error:", result.error);
          return;
        }

        if (result.data) {
          const user = result.data;

          // Set employee data
          setSelectedEmployee({
            id: user.employee_Id,
            name: user.name,
            email: "", // Add email handling if needed
            phone: user.phone,
            team: user.team,
            skill: user.skill,
            role: "", // Add role handling if needed
            currentWorkload: user.current_Workload,
            startDate: user.start_Date,
            avatar: user.image,
          });

          // Extract tasks from assignments
          const tasksList = user.assigns.map(assignment => assignment.task);
          setTasks(tasksList);
          setUserId(user.employee_Id);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setError(errorMessage);
        console.error("Failed to fetch employee data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const refreshTasks = async () => {
    if (!id) return;

    const response = await axios.get<ApiResponse>(
      `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${id}`
    );

    const result = response.data;
    if (result.data?.assigns) {
      const tasksList = result.data.assigns.map(assignment => assignment.task);
      setTasks(tasksList);
    }
  };

  const handleSubmit = async () => {
    try {
      await refreshTasks();
      setIsLoading(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting task:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex h-screen bg-stale-50">
        <Sidebar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-stale-50">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] py-[1vw] px-[1.667vw] space-y-[1.25vw]">
            <SearchBar />

            {selectedEmployee && (
              <ProfileHeader
                id={selectedEmployee.id}
                showEditButton={false}
              />
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="px-[1.25vw] py-[0.625vw]">
                <div className="flex justify-between items-center mb-[0.833vw]">
                  <h3 className="text-[1.25vw] ml-[0.833vw] mt-[1.25vw] font-medium">
                    Task Have Been Done
                  </h3>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white text-[0.8vw] px-[0.833vw] h-[2.5vw] mr-[0.833vw] mt-[1.25vw] rounded-[0.5vw]"
                  >
                    Assign New Task
                  </Button>
                </div>

                <div className="rounded-lg p-[0.833vw]">
                  <DataTable
                    tasks={tasks}
                    isLoading={isLoading}
                    onTaskUpdate={refreshTasks}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <BulkTaskModal
              userId={userId || ""}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleSubmit}
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}