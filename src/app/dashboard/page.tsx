"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar";
import { EmployeeData, columns } from "./columns";
import { DataTable } from "./data-table";
import ProtectedRoute from "@/components/protected-route";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import { AddEmployeeModal } from "@/components/organisms/AddEmployeeModal";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

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
  const [team, setTeam] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (!team) return;
      
      console.log("Full decoded token:", jwtDecode(Cookies.get("auth_token") || ""));
      console.log("Team from token:", team);
      
      const response = await axios.get(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/team/${encodeURIComponent(team)}`
      );
  
      const result = response.data;
  
      if (result.error) {
        console.error("API Error:", result.error);
        setData([]);
      } else {
        setData(
          result.data
            .filter((emp: ApiEmployeeData) => 
              emp.users[0]?.role === "Employee"
            )
            .map((emp: ApiEmployeeData) => ({
              employee_id: emp.employee_Id,
              name: emp.name,
              team: emp.team,
              skill: emp.skill,
              current_workload: emp.current_Workload,
              email: emp.users[0]?.email || "N/A",
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

  useEffect(() => {
    const authStorage = Cookies.get("auth_token");
    if (authStorage) {
      try {
        const userData: { team: string } = jwtDecode(authStorage);
        console.log("Decoded token data:", userData);
        console.log("Team from decoded token:", userData.team);
        setTeam(userData.team);
      } catch (error) {
        console.error("Error decoding auth token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (team) {
      fetchData();
    }
  }, [team]);

  if (isLoading && !data.length) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-200">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] py-[1vw] px-[1.667vw] space-y-[1.25vw]">
            <DataTable 
              columns={columns} 
              data={data} 
              onRefresh={fetchData}
              isLoading={isLoading}
              addEmployeeModal={
                <AddEmployeeModal 
                  onSuccess={async () => {
                    await fetchData();
                  }} 
                />
              }
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}