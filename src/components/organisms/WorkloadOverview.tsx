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
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  return Math.ceil((days + 1) / 7);
};

const getMonthName = (month: number): string => {
  return new Date(2024, month).toLocaleString('default', { month: 'long' });
};

export default function WorkloadOverview({ tasks, currentWorkload, averageWorkload }: any) {
  const monthlyWorkloadData = React.useMemo(() => {
    const workloadByMonth = new Map<string, Map<number, number>>();

    tasks?.forEach((task: any) => {
      const startDate = new Date(task.start_Date);
      const endDate = new Date(task.end_Date);
      const weeks = getWeekNumber(endDate) - getWeekNumber(startDate) + 1;
      const weeklyWorkload = task.workload / weeks;
      
      for (let i = 0; i < weeks; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i * 7);
        const weekNumber = getWeekNumber(currentDate);
        const monthYear = `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;

        if (!workloadByMonth.has(monthYear)) {
          workloadByMonth.set(monthYear, new Map());
        }

        const workloadMap = workloadByMonth.get(monthYear);
        workloadMap?.set(weekNumber, (workloadMap.get(weekNumber) || 0) + weeklyWorkload);
      }
    });

    return Array.from(workloadByMonth.entries()).map(([monthYear, weeklyData]) => ({
      monthYear,
      weeklyData: Array.from(weeklyData.entries()).map(([_, workload], index) => ({
        week: index + 1,
        workload: Number(workload.toFixed(2)),
      })),
    }));
  }, [tasks]);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
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
                formatter={(value: number) => [`${value} hours`, "Workload"]}
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="workload" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#fff', stroke: '#2563eb' }}
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