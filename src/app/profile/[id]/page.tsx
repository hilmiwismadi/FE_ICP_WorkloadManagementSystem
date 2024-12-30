"use client";
import React from 'react';
import { useEffect, useState } from 'react';
import ProfileHeader from '@/components/organisms/ProfileHeader';
import ProgrammingLanguages from '@/components/organisms/ProgrammingLanguages';
import WorkloadOverview from '@/components/organisms/WorkloadOverview';
import WorkExperience from '@/components/organisms/WorkExperience';
import TaskList from '@/components/organisms/TaskList';
import Sidebar from '@/components/sidebar';

export default function ProfilePage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

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

  const workExperience = {
    role: "Backend Engineer",
    joinDate: "2023-02-15",
    batch: "Batch 86"
  };

  const programmingLanguages = [
    { name: "Express.js", icon: "/icons/express.svg" },
    { name: "Laravel", icon: "/icons/laravel.svg" },
    { name: "Golang", icon: "/icons/golang.svg" },
    { name: "Django", icon: "/icons/django.svg" },
  ];

  const workloadTrend = [
    { month: "Jan", value: 65 },
    { month: "Feb", value: 85 },
    { month: "Mar", value: 75 },
    { month: "Apr", value: 45 },
    { month: "May", value: 65 },
    { month: "Jun", value: 70 },
  ];

  const tasks = [
    {
      id: "1",
      title: "Fix Bug API Endpoint",
      description: "Bertanggung jawab untuk menyelsaikan bug Aplikasi pada sisi Backend bersama 2 karyawan lain",
      dueDate: "14/01/2025",
      priority: "8.2",
    },
    {
      id: "2",
      title: "Fix Bug API Endpoint",
      description: "Bertanggung jawab untuk menyelsaikan bug Aplikasi pada sisi Backend bersama 2 karyawan lain",
      dueDate: "16/01/2025",
      priority: "4.1",
    },
    {
      id: "3",
      title: "Fix Bug API Endpoint",
      description: "Bertanggung jawab untuk menyelsaikan bug Aplikasi pada sisi Backend bersama 2 karyawan lain",
      dueDate: "12/01/2025",
      priority: "2.1",
    },
    {
      id: "4",
      title: "Fix Bug API Endpoint",
      description: "Bertanggung jawab untuk menyelsaikan bug Aplikasi pada sisi Backend bersama 2 karyawan lain",
      dueDate: "14/01/2025",
      priority: "8.2",
    }
  ];

  return (
    <div className="flex max-h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out`}
      >
        <div className="h-screen overflow-y-auto mt-4 px-4">
          <div className="container w-[82vw] mx-auto mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Main Content Area */}
              <div className="col-span-12 xl:col-span-9 space-y-6">
                <ProfileHeader 
                  employee={mockEmployee}
                  showEditButton={true}
                />
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-6 space-y-6">
                    <ProgrammingLanguages 
                      languages={programmingLanguages}
                      className="bg-white rounded-full shadow-sm p-6 min-h-[24vw]"
                    />
                    <WorkExperience 
                      experience={workExperience}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <WorkloadOverview 
                      workloadTrend={workloadTrend}
                      currentWorkload={mockEmployee.currentWorkload}
                      averageWorkload={mockEmployee.averageWorkload}
                      className="bg-white rounded-xl shadow-sm p-6 h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="col-span-12 xl:col-span-3">
                <TaskList 
                  tasks={tasks}
                  className="bg-white rounded-xl shadow-sm p-6 sticky top-6"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}