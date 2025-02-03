import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const getBarColor = (value: number): string => {
  const clampedValue = Math.max(0, Math.min(value, 100));
  return clampedValue <= 50 
    ? `rgb(${Math.floor((clampedValue / 50) * 255)}, 255, 0)`
    : `rgb(255, ${Math.floor((1 - ((clampedValue - 50) / 50)) * 255)}, 0)`;
};

const CustomProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-[1vw] bg-gray-200 rounded-full overflow-hidden">
    <div
      className="h-full transition-all duration-300 ease-in-out"
      style={{
        width: `${value}%`,
        backgroundColor: getBarColor(value),
      }}
    />
  </div>
);

const getWeekNumber = (date: Date): number => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysSinceFirstDay = Math.floor((date.getTime() - firstDayOfMonth.getTime()) / (1000 * 3600 * 24));
  
  // Adjust so Monday is treated as the start of the week
  const firstDayOffset = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Monday, ..., 6 = Sunday
  return Math.ceil((daysSinceFirstDay + firstDayOffset + 1) / 7); // No Week 5 merging
};

const getMonthName = (month: number): string => {
  return new Date(2024, month).toLocaleString('default', { month: 'long' });
};

const monthOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function WorkloadOverview({ tasks, currentWorkload, averageWorkload }: any) {
  const monthlyWorkloadData = React.useMemo(() => {
    const workloadByMonth = new Map<string, Map<number, { 
      total: number,
      ongoing: number,
      completed: number 
    }>>();

    tasks?.forEach((assign: any) => {
      const task = assign.task;
      if (!task) return;
      
      const startDate = new Date(task.start_Date);
      const endDate = new Date(task.end_Date);
      
      // Iterate through each day between start and end date
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const monthYear = `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;
        const weekNumber = getWeekNumber(currentDate);
        
        if (!workloadByMonth.has(monthYear)) {
          workloadByMonth.set(monthYear, new Map());
        }

        const workloadMap = workloadByMonth.get(monthYear);
        if (!workloadMap?.has(weekNumber)) {
          workloadMap?.set(weekNumber, { total: 0, ongoing: 0, completed: 0 });
        }

        // Calculate daily workload (total workload divided by total days)
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
        const dailyWorkload = task.workload / totalDays;

        const currentStats = workloadMap?.get(weekNumber);
        if (currentStats) {
          currentStats.total += dailyWorkload;
          if (task.status === 'Done' || task.status === 'Approved') {
            currentStats.completed += dailyWorkload;
          } else {
            currentStats.ongoing += dailyWorkload;
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Sort months chronologically and process the data
    return Array.from(workloadByMonth.entries())
      .sort(([monthYearA], [monthYearB]) => {
        const [monthA, yearA] = monthYearA.split(' ');
        const [monthB, yearB] = monthYearB.split(' ');
        
        if (yearA !== yearB) {
          return parseInt(yearA) - parseInt(yearB);
        }
        return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
      })
      .map(([monthYear, weeklyData]) => ({
        monthYear,
        weeklyData: Array.from(weeklyData.entries())
          .sort(([weekA], [weekB]) => weekA - weekB) // Sort weeks numerically
          .map(([week, stats]) => ({
            week,
            total: Number(stats.total.toFixed(2)),
            ongoing: Number(stats.ongoing.toFixed(2)),
            completed: Number(stats.completed.toFixed(2)),
          })),
      }));
  }, [tasks]);

  // Set default month to current month
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentDate = new Date();
    const currentMonthYear = `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;
    return Math.max(0, monthlyWorkloadData.findIndex(data => data.monthYear === currentMonthYear));
  });

  const currentMonthData = monthlyWorkloadData[currentMonthIndex];

  return (
    <div className="space-y-[1.25vw] max-h-screen">
      <Card className="md:col-span-3 bg-[#0A1D56] h-[19vw] relative">
        <CardHeader className="pb-[1vw]">
          <CardTitle className="text-white text-[1.25vw] flex justify-between items-center">
            <span>Weekly Workload {currentMonthData?.monthYear}</span>
            <div className="flex gap-[0.5vw]">
              <button 
                onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
                className="p-[0.5vw] bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all"
                disabled={currentMonthIndex === 0}
              >
                <ChevronLeft className="w-[1.2vw] h-[1.2vw]" />
              </button>
              <button 
                onClick={() => setCurrentMonthIndex(prev => Math.min(monthlyWorkloadData.length - 1, prev + 1))}
                className="p-[0.5vw] bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all"
                disabled={currentMonthIndex === monthlyWorkloadData.length - 1}
              >
                <ChevronRight className="w-[1.2vw] h-[1.2vw]" />
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[14vw] px-[0.417vw] mr-[1.8vw] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentMonthData?.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="week" 
                stroke="#fff" 
                tickFormatter={(week) => `Week ${week}`}
                fontSize="0.8vw"
              />
              <YAxis 
                stroke="#fff" 
                fontSize="0.8vw"
              />
              <Tooltip
                labelFormatter={(week) => `Week ${week}`}
                formatter={(value: number, name: string) => [
                  `${value} Workload Units`, 
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total"
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#fff', stroke: '#2563eb' }}
              />
              <Line 
                type="monotone" 
                dataKey="ongoing" 
                name="Ongoing"
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#fff', stroke: '#ef4444' }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                name="Completed"
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#fff', stroke: '#22c55e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-[1vw] h-[12.666vw]">
        {/* Current Workloads */}
        <Card className="bg-[#0A1D56] font-semibold flex flex-col items-center justify-center">
          <CardHeader className="py-0 px-[2vw] w-full">
            <CardTitle className="text-white text-[1.25vw]">Current Workloads</CardTitle>
          </CardHeader>
          <CardContent className="pt-[0.104vw] py-0 px-[2vw] w-full">
            <div className="flex items-center space-x-[0.833vw]">
              <div className="w-full">
                <CustomProgressBar value={currentWorkload} />
              </div>
              <p className="text-white text-[1.25vw]">{currentWorkload}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Average Employee Workloads */}
        <Card className="bg-[#0A1D56] font-semibold flex flex-col items-center justify-center">
          <CardHeader className="py-0  px-[2vw] w-full">
            <CardTitle className="text-white text-[1.25vw]">Average Employee Workloads</CardTitle>
          </CardHeader>
          <CardContent className="pt-[0.104vw] py-0 px-[2vw] w-full">
            <div className="flex items-center space-x-[0.833vw]">
              <div className="w-full">
                <CustomProgressBar value={averageWorkload} />
              </div>
              <p className="text-white text-[1.25vw]">{averageWorkload}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}