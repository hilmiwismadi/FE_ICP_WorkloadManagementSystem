"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/organisms/SearchBarTask';
import ProfileHeader from '@/components/organisms/ProfileHeader';
import Sidebar from '@/components/sidebar';
import { DataTable } from '../data-table';
import { NewTaskModal } from '@/components/organisms/NewTaskModal';
import { TaskData, columns } from "../columns";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  team: string;
  skill: string;
  role: string;
  currentWorkload: number;
  startDate: string;
  avatar?: string;
}

export default function TaskPageId() {
  const router = useRouter();
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${id}`
        );

        console.log(response.data);

        const result = response.data;

        if (result.error) {
          console.error("API Error:", result.error);
        } else if (result.data) {
          const user = result.data;
          setSelectedEmployee({
            id: user.employee_Id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            team: user.team,
            skill: user.skill,
            role: user.role,
            currentWorkload: user.current_Workload,
            startDate: user.start_Date,
            avatar: user.image || '/placeholder-avatar.png'
          });
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handleSubmit = (taskData: {
    name: string;
    workload: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => {
    console.log('Submitted Task:', taskData);
  };

  return (
    <div className="flex h-screen bg-stale-50">
      <Sidebar />
      <div className="flex-grow overflow-auto flex items-start justify-center">
        <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] p-[1.667vw] space-y-[1.25vw]">
          <SearchBar /> 
          {selectedEmployee && (
            <ProfileHeader 
              employee={selectedEmployee}
              showEditButton={false}
            />
          )}

          {/* Task Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-[1.25vw] py-[0.625vw]">
              <div className="flex justify-between items-center mb-[0.833vw]">
                <h3 className="text-[1.25vw] ml-[0.833vw] mt-[1.25vw] font-medium">On Going Task</h3>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white text-[0.8vw] px-[0.833vw] h-[2.5vw] mr-[0.833vw] mt-[1.25vw] rounded-[0.5vw]"
                >
                  Assign New Task
                </Button>
              </div>

              {/* Table placeholder */}
              <div className="rounded-lg p-[0.833vw]">
                <DataTable />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <NewTaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        employeeId={selectedEmployee?.id}
      />
    </div>
  );
}
