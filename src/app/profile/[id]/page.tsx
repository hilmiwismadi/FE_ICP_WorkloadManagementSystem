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
import ProtectedRoute from "@/components/protected-route";

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
  assigns?: Array<{
    task_Id: string;
    employee_Id: string;
    task: {
      task_Id: string;
      type: string;
      description: string;
      status: string;
      workload: number;
      start_Date: string;
      end_Date: string;
      user_Id: string;
      priority: string;
      title: string;
    };
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
          "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read"
        );

        if (response.data && response.data.data) {
          // Calculate average workload
          const employees = response.data.data;
          const totalWorkload = employees.reduce(
            (sum: number, emp: Employee) => {
              const workloadPercentage = (emp.current_Workload / 10.7) * 100;
              return sum + workloadPercentage;
            },
            0
          );

          const calculatedAverage = totalWorkload / employees.length;
          setAverageWorkload(Math.round(calculatedAverage));
        }
 
      } catch (error) {
        console.error("Failed to fetch employees data:", error);
      }
    };

    fetchAllEmployees();
  }, []);

  console.log(averageWorkload);

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

  const tasks = employee?.assigns
    ? employee.assigns
        .filter((assign) => assign && assign.task && assign.task.status === "Ongoing")
        .map((assign) => ({
          id: assign.task.task_Id || '',
          type: assign.task.type || '',
          title: assign.task.title || '',
          description: assign.task.description || '',
          status: assign.task.status || '',
          priority: assign.task.workload || '',
          dueDate: assign.task.end_Date
            ? new Date(assign.task.end_Date).toLocaleDateString()
            : "N/A",
          startDate: assign.task.start_Date
            ? new Date(assign.task.start_Date).toISOString()
            : null,
          endDate: assign.task.end_Date 
            ? new Date(assign.task.end_Date).toISOString() 
            : null,
        }))
    : [];

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
    <ProtectedRoute>
      <div className="flex h-screen bg-stale-50">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div
            className={`flex-1 max-h-screen py-[1vw] px-[1.667vw] ml-[0.417vw] w-[80vw] space-y-[1.25vw] transition-all duration-300 ease-in-out`}
          >
            <div className="">
              <div className="grid grid-cols-12 gap-[1.25vw]">
                <div className="col-span-12 xl:col-span-9 space-y-[1.25vw]">
                  <ProfileHeader
                    id={employee.employee_Id}
                    showEditButton={true}
                  />
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
                        tasks={employee.assigns}
                        currentWorkload={Math.round(
                          (employee.current_Workload / 10.7) * 100
                        )}
                        averageWorkload={averageWorkload}
                        className="rounded-[1vw] shadow-sm p-[1.25vw] h-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-12 xl:col-span-3 space-y-[1vw]">
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
    </ProtectedRoute>
  );
}
