"use client";

import Sidebar from "@/components/sidebar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EditUserProfile from "../edit-user-profile";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import axios from "axios";

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
  users: Array<{
    user_Id: string;
    email: string;
    role: string;
  }>;
}

export default function PleaseLoginPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-grow overflow-auto flex items-start justify-center">
        <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] py-[1vw] px-[1.667vw] space-y-[1.25vw]">
          {employee && <EditUserProfile employee={employee} />}
        </div>
      </div>
    </div>
  );
}
