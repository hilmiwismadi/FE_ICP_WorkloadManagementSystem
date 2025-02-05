import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const PRIORITY_COLORS: Record<string, string> = {
  High: '#ef4444',
  Normal: '#3b82f6',
  Low: '#22c55e',
};

interface Task {
  task_Id: string;
  workload: number;
  mcda: number;
  status: string;
  priority: string;
  type: string;
}

interface EmployeeStatisticsProps {
  employeeId: string;
}

const EmployeeStatistics: React.FC<EmployeeStatisticsProps> = ({ employeeId }) => {
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://be-icpworkloadmanagementsystem.up.railway.app/api/task/emp/read/${employeeId}`);
        if (!response.ok) throw new Error('Failed to fetch task data');
        const result = await response.json();
        setTaskData(result.data || []);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) fetchTaskData();
  }, [employeeId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (taskData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No task data available
      </div>
    );
  }

  const totalTasks = taskData.length;
  const totalWorkload = taskData.reduce((sum, task) => sum + task.workload, 0);
  const avgMCDA = totalTasks ? taskData.reduce((sum, task) => sum + task.mcda, 0) / totalTasks : 0;

  const statusChartData = Object.entries(
    taskData.reduce<Record<string, number>>((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const priorityChartData = Object.entries(
    taskData.reduce<Record<string, number>>((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tasks</span>
              <span className="font-semibold">{totalTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Workload</span>
              <span className="font-semibold">{totalWorkload}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average MCDA Score</span>
              <span className="font-semibold">{avgMCDA.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {priorityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeStatistics;
