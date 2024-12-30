"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/organisms/SearchBar';
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">

          <ProfileHeader />

          {/* Task Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium">On Going Task</h3>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Assign New Task
                </Button>
              </div>

              {/* Table placeholder */}
              <div className="bg-gray-50 rounded-lg p-4">
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