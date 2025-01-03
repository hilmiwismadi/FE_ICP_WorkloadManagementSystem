import axios from "axios";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Sidebar from "../../components/sidebar";
import { EmployeeData, columns } from "./columns";
import { DataTable } from "@/components/data-table";

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
    <div className="w-full bg-white h-screen aspect-[1920/1080] text-[10vw] text-black flex justify-center items-center relative">
      <Sidebar />
      <div className="flex-grow">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
