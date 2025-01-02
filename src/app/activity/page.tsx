"use client"

import React from 'react';
import SearchBar from '@/components/organisms/SearchBarActivity';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '@/components/sidebar';

// Interfaces
interface Employee {
  id: string;
  name: string;
  role: string;
  division: string;
  taskCount: number;
  totalWorkload: number;
  aggregateScore: number;
}

interface DivisionMetrics {
  name: string;
  taskCount: number;
  totalWorkload: number;
  aggregateScore: number;
}

// Mock data
const topEmployees: Employee[] = [
  { 
    id: "12003",
    name: "Varick Zahir",
    role: "Backend Engineer",
    division: "Backend",
    taskCount: 15,
    totalWorkload: 850,
    aggregateScore: 92
  },
  {
    id: "12004",
    name: "John Doe",
    role: "Frontend Engineer",
    division: "Frontend",
    taskCount: 12,
    totalWorkload: 780,
    aggregateScore: 88
  },
  {
    id: "12005",
    name: "Jane Smith",
    role: "DevOps Engineer",
    division: "DevOps",
    taskCount: 10,
    totalWorkload: 720,
    aggregateScore: 85
  }
];

const bottomEmployees: Employee[] = [
  {
    id: "12006",
    name: "Alice Johnson",
    role: "QA Engineer",
    division: "QA",
    taskCount: 4,
    totalWorkload: 220,
    aggregateScore: 45
  },
  {
    id: "12007",
    name: "Bob Wilson",
    role: "Frontend Engineer",
    division: "Frontend",
    taskCount: 3,
    totalWorkload: 180,
    aggregateScore: 42
  },
  {
    id: "12008",
    name: "Carol Brown",
    role: "Backend Engineer",
    division: "Backend",
    taskCount: 2,
    totalWorkload: 150,
    aggregateScore: 38
  }
];

const divisionMetrics: DivisionMetrics[] = [
  { name: "Backend", taskCount: 45, totalWorkload: 2800, aggregateScore: 88 },
  { name: "Frontend", taskCount: 38, totalWorkload: 2400, aggregateScore: 82 },
  { name: "DevOps", taskCount: 32, totalWorkload: 2100, aggregateScore: 78 },
  { name: "QA", taskCount: 28, totalWorkload: 1800, aggregateScore: 72 }
].sort((a, b) => b.aggregateScore - a.aggregateScore);

const EmployeeMetricsCard = ({ title, employees, type }: { 
  title: string, 
  employees: Employee[], 
  type: 'top' | 'bottom' 
}) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-[1.25vw] font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-[0.625vw]">
        {employees.map((employee, index) => (
          <div key={employee.id} className="flex items-center justify-between py-[0.5vw] px-[1.5vw] bg-gray-50 rounded-[1vw]">
            <div className="flex items-center gap-[0.8vw]">
              <span className={`text-[1vw] font-bold ${
                type === 'top' ? 'text-green-500' : 'text-red-500'
              }`}>
                #{index + 1}
              </span>
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-[0.8vw] text-gray-500">{employee.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{employee.aggregateScore}%</p>
              <p className="text-[0.8vw] text-gray-500">{employee.taskCount} tasks</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function ActivityPage() {
  return (
    <div className="flex h-screen bg-stale-50">
      <Sidebar />
      <div className="flex-grow overflow-auto flex items-start justify-center">
        <div className="flex-1 max-h-screen p-[1.667vw] ml-[0.417vw] w-[80vw] space-y-[1.25vw] transition-all duration-300 ease-in-out">
          <SearchBar />
          <div className="grid grid-cols-12 gap-[2vw]">
            {/* Left Column - Employee Rankings */}
            <div className="col-span-12 md:col-span-4 space-y-[1.5vw]">
              <EmployeeMetricsCard 
                title="Top Performing Employees"
                employees={topEmployees}
                type="top"
              />
              <EmployeeMetricsCard 
                title="Employees Needing Support"
                employees={bottomEmployees}
                type="bottom"
              />
            </div>

            {/* Right Column - Division Rankings */}
            <div className="col-span-12 md:col-span-8">
              <Card className="w-full h-full">
                <CardHeader>
                  <CardTitle className="text-[1.25vw] font-semibold">
                    Division Performance Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[30vw]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={divisionMetrics}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar 
                        dataKey="aggregateScore" 
                        fill="#4ECDC4"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}