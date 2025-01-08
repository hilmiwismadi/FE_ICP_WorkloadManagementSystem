"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import ProfileHeader from "@/components/organisms/ProfileHeader";
import ProgrammingLanguages from "@/components/organisms/ProgrammingLanguages";
import WorkloadOverview from "@/components/organisms/WorkloadOverview";
import WorkExperience from "@/components/organisms/WorkExperience";
import TaskList from "@/components/organisms/TaskList";
import Sidebar from "@/components/sidebar";
import ActivityDetailsButton from "@/components/ui/ActivityDetailsButton";
import LoadingScreen from "@/components/organisms/LoadingScreen";

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
  techStacks: Array<{
    techStack_Id: number;
    name: string;
    image: string;
    employee_Id: string;
  }>;
  tasks: Array<{
    task_Id: string;
    type: string;
    description: string;
    status: string;
    workload: number;
    start_Date: string;
    end_Date: string;
    employee_Id: string;
    user_Id: string;
  }>;
}

export default function ProfilePage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [averageWorkload, setAverageWorkload] = useState<number>(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Fetch all employees data to calculate average workload
  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const response = await axios.get(
          'https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read'
        );

        if (response.data && response.data.data) {
          // Calculate average workload
          const employees = response.data.data;
          const totalWorkload = employees.reduce((sum: number, emp: Employee) => {
            const workloadPercentage = (emp.current_Workload / 15) * 100;
            return sum + workloadPercentage;
          }, 0);

          const calculatedAverage = totalWorkload / employees.length;
          setAverageWorkload(Math.round(calculatedAverage));
        }
      } catch (error) {
        console.error("Failed to fetch employees data:", error);
      }
    };

    fetchAllEmployees();
  }, []);

  // Fetch individual employee data
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

  const workExperience = {
    role: employee?.role || "",
    joinDate: employee?.start_Date || "",
    batch: employee?.start_Date
      ? `Batch ${new Date(employee.start_Date).getFullYear() - 1938}`
      : "Unknown Batch",
  };

  const programmingLanguages =
    employee?.techStacks.map((stack) => ({
      name: stack.name,
      icon: stack.image,
    })) || [];

  const workloadTrend = [
    { month: "Jan", value: 65 },
    { month: "Feb", value: 85 },
    { month: "Mar", value: 75 },
    { month: "Apr", value: 45 },
    { month: "May", value: 65 },
    { month: "Jun", value: 70 },
  ];

  const tasks =
    employee?.tasks
      .filter((task) => task.status === "Ongoing")
      .map((task) => ({
        id: task.task_Id,
        type: task.type,
        title: task.description,
        priority: task.workload.toString(),
        dueDate: new Date(task.end_Date).toLocaleDateString(),
      })) || [];

  const employeeData = employee
    ? {
        id: employee.employee_Id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        team: employee.team,
        role: employee.role,
        currentWorkload: employee.current_Workload,
        averageWorkload: averageWorkload,
        avatar: employee.image,
      }
    : null;

  if (!employee) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-stale-50">
      <Sidebar />
      <div className="flex-grow overflow-auto flex items-start justify-center">
        <div className={`flex-1 max-h-screen p-[1.667vw] ml-[0.417vw] w-[80vw] space-y-[1.25vw] transition-all duration-300 ease-in-out`}>
          <div className="py-[0.625vw]">
            <div className="grid grid-cols-12 gap-[1.25vw]">
              <div className="col-span-12 xl:col-span-9 space-y-[1.25vw]">
                <ProfileHeader employee={employeeData} showEditButton={true} />
                <div className="grid grid-cols-12 gap-[1.25vw]">
                  <div className="col-span-12 md:col-span-5 space-y-[1.25vw]">
                    <ProgrammingLanguages
                      languages={programmingLanguages}
                      className="bg-white rounded-full shadow-sm p-[1.25vw] min-h-[24vw]"
                    />
                    <WorkExperience experience={workExperience} />
                  </div>
                  <div className="col-span-12 md:col-span-7">
                    <WorkloadOverview
                      workloadTrend={workloadTrend}
                      currentWorkload={Math.round(
                        (employee.current_Workload / 15) * 100
                      )}
                      averageWorkload={averageWorkload}
                      className="bg-white rounded-[1vw] shadow-sm p-[1.25vw] h-full"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-3 space-y-[1.5vw]">
                <TaskList
                  tasks={tasks}
                  className="bg-white rounded-[0.625vw] shadow-sm p-[1.25vw] sticky top-[1.25vw]"
                />
                <ActivityDetailsButton employeeId={employee.employee_Id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}