"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Icon } from "@iconify/react";
import Sidebar from "../../../components/sidebar";
import { TaskData, columns } from "../columns";
import { DataTableHalf } from "@/app/activity/data-table-half";
import { historyData } from "../data-history";
import { ongoingData } from "../data-ongoing";
import UserProfile from "../user-profile";
import SearchAndFilter, { FilterOption } from "../search-filter";
import SearchBar from '@/components/organisms/SearchBarActivity';
import LoadingScreen from '@/components/organisms/LoadingScreen';

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

const filterOptions: FilterOption[] = [
  { value: "task_id", label: "Task_ID", type: "string" as const },
  { value: "name", label: "Name", type: "string" as const },
  { value: "description", label: "Deskripsi", type: "string" as const },
  {
    value: "current_workload",
    label: "Current Workload",
    type: "number" as const,
  },
];

export default function Activity() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");
  const [selectedFilter, setSelectedFilter] = useState<string>("name");
  const [filterValue, setFilterValue] = useState<string>("");

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

    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setFilterValue("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);
  };

  const currentFilterOption = filterOptions.find(
    (option) => option.value === selectedFilter
  );

  if (!employee) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-grow overflow-auto flex items-start justify-center">
        <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] p-[1.667vw] space-y-[1.25vw]">
          <SearchBar />

          <UserProfile employee={employee} />

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
              data={activeTab === "ongoing" ? ongoingData : historyData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}