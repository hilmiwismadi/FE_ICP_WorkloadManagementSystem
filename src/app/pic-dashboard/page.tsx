"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar";
import { EmployeeData, columns } from "./columns";
import { DataTable } from "./data-table";
import ProtectedRoute from "@/components/protected-route";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ";
  }
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads")) {
    return `https://be-icpworkloadmanagementsystem.up.railway.app/api${imageUrl}`;
  }
  return imageUrl;
};

export default function Dashboard() {
  const [data, setData] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState<"board" | "list">("list");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read"
      );

      const result = response.data;

      if (result.error) {
        console.error("API Error:", result.error);
        setData([]);
      } else {
        const filteredData = result.data
          .filter((emp: any) =>
            emp.users.some((user: any) => user.role === "PIC")
          )
          .map((emp: any) => ({
            employee_id: emp.employee_Id,
            name: emp.name,
            team: emp.team,
            skill: emp.skill,
            current_workload: emp.current_Workload,
            email:
              emp.users.find((user: any) => user.role === "PIC")?.email || "",
            phone: emp.phone,
            image: getImageUrl(emp.image),
          }));

        setData(filteredData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading && !data.length) {
    return <LoadingScreen />;
  }

  // Group employees by team
  const groupedData = data.reduce((acc, emp) => {
    const team = emp.team || "Unassigned";
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(emp);
    return acc;
  }, {} as Record<string, EmployeeData[]>);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] py-[1vw] px-[1.667vw] space-y-[1.25vw]">
            <div className="sticky top-[calc(2vw)] bg-stale-50 z-10 mb-[2.5vw]">
              <div className="flex justify-between items-center mb-[1vw]">
                <h1 className="text-[1.4vw] font-bold text-gray-900">
                  PIC
                  <div className="">
                    <p className="text-[0.8vw] text-gray-500">
                      Total PICs: {data.length}
                    </p>
                  </div>
                </h1>
                <div className="flex items-center">
                  <div className="flex bg-gray-300 rounded-[0.3vw] p-[0.2vw]">
                    <button
                      onClick={() => setViewType("board")}
                      className={`px-[0.6vw] py-[0.2vw] rounded-[0.2vw] transition-all ${
                        viewType === "board"
                          ? "bg-white shadow text-gray-900"
                          : "text-gray-500"
                      } text-[0.7vw]`}
                    >
                      Board
                    </button>
                    <button
                      onClick={() => setViewType("list")}
                      className={`px-[0.5vw] py-[0.1vw] rounded-[0.2vw] transition-all ${
                        viewType === "list"
                          ? "bg-white shadow text-gray-900"
                          : "text-gray-500"
                      } text-[0.7vw]`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {viewType === "board" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[1vw] pb-[0.625vw]">
                {Object.entries(groupedData).map(([team, employees]) => (
                  <motion.div
                    key={team}
                    layout
                    className="bg-white rounded-[0.4vw] shadow-sm flex flex-col"
                  >
                    <div className="px-[1.25vw] py-[1.5vw] border-b-[0.04vw] sticky top-0 bg-white z-10">
                      <h2 className="font-semibold text-gray-900 text-[1vw]">
                        {team}
                      </h2>
                      <span className="text-[0.8vw] text-gray-500">
                        {employees.length} employees
                      </span>
                    </div>

                    <div className="flex-1 overflow-auto p-[0.625vw] space-y-[0.625vw]">
                      <AnimatePresence>
                        {employees.map((emp) => (
                          <motion.div
                            key={emp.employee_id}
                            className="border p-4 rounded-lg shadow-md flex items-center space-x-4 mb-4 transition-transform transform hover:scale-105"
                          >
                            <img
                              src={emp.image}
                              alt={emp.name}
                              className="w-16 h-16 rounded-full border-2 border-gray-300"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {emp.name}
                              </h3>
                              <p className="text-gray-700">{emp.skill}</p>
                              <p className="text-gray-500">{emp.phone}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={data}
                onRefresh={fetchData}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
