"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Sidebar from "../../../components/sidebar";
import { TaskData, columns } from "../columns";
import { DataTableHalf } from "@/app/activity/data-table-half";
import UserProfile from "../user-profile";
import SearchBar from "@/components/organisms/SearchBarActivity";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import ProtectedRoute from "@/components/protected-route";

interface Task {
  task_Id: string;
  description: string;
  employee_Id: string;
  end_Date: Date;
  start_Date: Date;
  status: string;
  type: string;
  workload: number;
}

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  email: string;
  phone: string;
  team: string;
  skill: string;
  role: string;
  current_Workload: number;
  start_Date: string;
}

export default function Activity() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");
  const [loading, setLoading] = useState(true);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${id}`
        );
        if (response.data && response.data.data) {
          setEmployee(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
      }
    };

    const fetchTaskData = async () => {
      try {
        const response = await axios.get(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/emp/read/${id}`
        );
        if (response.data && response.data.data) {
          setTasks(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch task data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeData();
      fetchTaskData();
    }
  }, [id]);

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(
    (task) => (activeTab === "ongoing" ? task.status === "Ongoing" : true) // Show all tasks in history tab
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] py-[1vw] px-[1.667vw] space-y-[1.25vw]">
            <SearchBar />

            {employee && <UserProfile employee={employee} />}

            {/* Tabs */}
            <div className="flex border-b mb-[1vw] w-full mx-auto">
              <button
                className={`px-[3vw] py-[0.3vw] text-[1vw] font-medium w-6/12 ${
                  activeTab === "ongoing"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("ongoing")}
              >
                On Going
              </button>
              <button
                className={`px-[3vw] py-[0.3vw] text-[1vw] font-medium w-6/12 ${
                  activeTab === "history"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("history")}
              >
                History
              </button>
            </div>

            <div className="flex-grow">
              <DataTableHalf
                columns={columns}
                data={filteredTasks.map((task) => ({
                  task_id: task.task_Id,
                  description: task.description,
                  workload: task.workload,
                  start_date: task.start_Date,
                  end_date: task.end_Date,
                  status: task.status,
                  type: task.type,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
