import axios from "axios";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Sidebar from "../../components/sidebar";
import { EmployeeData, columns } from "./columns";
import { DataTable } from "./data-table";
import ProtectedRoute from "@/components/protected-route";

async function getData(): Promise<EmployeeData[]> {
  try {
    const response = await axios.get(
      "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read"
    );

    const result = response.data;

    if (result.error) {
      console.error("API Error:", result.error);
      return [];
    }

    return result.data.map((emp: any) => ({
      employee_id: emp.employee_Id,
      name: emp.name,
      team: emp.team,
      skill: emp.skill,
      current_workload: emp.current_Workload,
      email: emp.email,
      phone: emp.phone,
    }));
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return [];
  }
}

export default async function Dashboard() {
  const data = await getData();

  return (
    <ProtectedRoute>
      {" "}
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
