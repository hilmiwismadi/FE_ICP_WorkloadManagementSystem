"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/organisms/SearchBarTask';
import ProfileHeader from '@/components/organisms/ProfileHeader';
import Sidebar from '@/components/sidebar';
import { DataTable } from './data-table';
import { NewTaskModal } from '@/components/organisms/NewTaskModal';
import { TaskData, columns } from "./columns";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar?: string;
}

const mockEmployees: Employee[] = [
  {
    id: '12003',
    name: 'Varick Zahir Sarjiman',
    position: 'Backend Engineer',
    department: 'APKT',
    avatar: '/placeholder-avatar.png'
  },
  {
    id: '12004',
    name: 'John Doe',
    position: 'Frontend Engineer',
    department: 'APKT',
    avatar: '/placeholder-avatar.png'
  },
];

export default function TaskPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleSearch = async (query: string) => {
    return mockEmployees.filter(emp =>
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.id.includes(query)
    );
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    router.push(`/task/${employee.id}`);
  };


  const handleSubmit = (taskData: {
    name: string;
    workload: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => {
    console.log('Submitted Task:', taskData);
  };

  const mockEmployee = {
    id: "12003",
    name: "Varick Zahir Sarjiman",
    email: "varickzahirsarjiman@mail.ugm.ac.id",
    phone: "+62 812-1212-1212",
    team: "Aplikasi Penanganan Pengaduan Keluhan dan Gangguan Pelanggan",
    role: "Backend Engineer",
    currentWorkload: 79,
    averageWorkload: 42,
  };

  return (
    <div className="flex h-screen bg-stale-50">
      <Sidebar />
      <div className="flex-grow overflow-auto flex items-start justify-center">
        <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] p-[1.667vw] space-y-[1.25vw]">
          <SearchBar /> 
          <ProfileHeader 
            employee={mockEmployee}
            showEditButton={false}
          />

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