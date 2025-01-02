"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import Sidebar from "../../components/sidebar";
import React, { useState } from "react";
import { TaskData, columns } from "./columns";
import { DataTableHalf } from "@/app/activity/data-table-half";
import { historyData } from "./data-history";
import { ongoingData } from "./data-ongoing";
import UserProfile from "./user-profile";
import SearchAndFilter, { FilterOption } from "./search-filter";
import SearchBar from '@/components/organisms/SearchBar';

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
  const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");
  const [selectedFilter, setSelectedFilter] = useState<string>("name");
  const [filterValue, setFilterValue] = useState<string>("");

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

  return (
    <div className="w-full bg-white h-screen aspect-[1920/1080] text-[10vw] text-black flex justify-center items-center relative">
      <Sidebar />
      <div className="flex flex-col w-full h-full">
        <SearchAndFilter
          selectedFilter={selectedFilter}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onInputChange={handleInputChange}
          currentFilterOption={currentFilterOption}
          filterValue={filterValue}
        />

        <UserProfile />

        {/* Tabs */}
        <div className="flex border-b mb-[1vw] w-[80vw] mx-auto">
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
  );
}
