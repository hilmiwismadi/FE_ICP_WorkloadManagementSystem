"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar";
import { EmployeeData, columns } from "./columns";
import { DataTable } from "./data-table";
import ProtectedRoute from "@/components/protected-route";
import LoadingScreen from "@/components/organisms/LoadingScreen";

interface ApiEmployeeData {
  employee_Id: string;
  name: string;
  team: string;
  skill: string;
  current_Workload: number;
  phone: string;
  users: Array<{
    email: string;
    role: string;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read"
        );

        const result = response.data;

        if (result.error) {
          console.error("API Error:", result.error);
          setData([]);
        } else {
          setData(
            result.data.map((emp: ApiEmployeeData) => ({
              employee_id: emp.employee_Id,
              name: emp.name,
              team: emp.team,
              skill: emp.skill,
              current_workload: emp.current_Workload,
              email: emp.users[0]?.email || "N/A", // Get email from users array
              phone: emp.phone,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-stale-50">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] py-[1vw] px-[1.667vw] space-y-[1.25vw]">
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
