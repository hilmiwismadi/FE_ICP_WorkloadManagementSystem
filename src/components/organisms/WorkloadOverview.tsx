import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const getBarColor = (value: number): string => {
  const clampedValue = Math.max(0, Math.min(value, 100));
  return clampedValue <= 50
    ? `rgb(${Math.floor((clampedValue / 50) * 255)}, 255, 0)`
    : `rgb(255, ${Math.floor((1 - (clampedValue - 50) / 50) * 255)}, 0)`;
};

const CustomProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-2 bg-gray-200 rounded-sm overflow-hidden">
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
  const daysSinceFirstDay = Math.floor(
    (date.getTime() - firstDayOfMonth.getTime()) / (1000 * 3600 * 24)
  );

  // Adjust so Monday is treated as the start of the week
  const firstDayOffset = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Monday, ..., 6 = Sunday
  return Math.ceil((daysSinceFirstDay + firstDayOffset + 1) / 7); // No Week 5 merging
};

const getMonthName = (month: number): string => {
  return new Date(2024, month).toLocaleString("default", { month: "long" });
};

const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function WorkloadOverview({
  tasks,
  currentWorkload,
  averageWorkload,
}: any) {
  const monthlyWorkloadData = React.useMemo(() => {
    const workloadByMonth = new Map<
      string,
      Map<
        number,
        {
          total: number;
          ongoing: number;
          completed: number;
        }
      >
    >();

    tasks?.forEach((assign: any) => {
      const task = assign.task;
      if (!task) return;

      const startDate = new Date(task.start_Date);
      const endDate = new Date(task.end_Date);

      // Iterate through each day between start and end date
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const monthYear = `${getMonthName(
          currentDate.getMonth()
        )} ${currentDate.getFullYear()}`;
        const weekNumber = getWeekNumber(currentDate);

        if (!workloadByMonth.has(monthYear)) {
          workloadByMonth.set(monthYear, new Map());
        }

        const workloadMap = workloadByMonth.get(monthYear);
        if (!workloadMap?.has(weekNumber)) {
          workloadMap?.set(weekNumber, { total: 0, ongoing: 0, completed: 0 });
        }

        // Calculate daily workload (total workload divided by total days)
        const totalDays =
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
          ) + 1;
        const dailyWorkload = task.workload / totalDays;

        const currentStats = workloadMap?.get(weekNumber);
        if (currentStats) {
          currentStats.total += dailyWorkload;
          if (task.status === "Done" || task.status === "Approved") {
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
        const [monthA, yearA] = monthYearA.split(" ");
        const [monthB, yearB] = monthYearB.split(" ");

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
    const currentMonthYear = `${getMonthName(
      currentDate.getMonth()
    )} ${currentDate.getFullYear()}`;
    return Math.max(
      0,
      monthlyWorkloadData.findIndex(
        (data) => data.monthYear === currentMonthYear
      )
    );
  });

  const currentMonthData = monthlyWorkloadData[currentMonthIndex];

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-sm rounded-[0.3vw] h-[19vw]">
        <CardHeader className="pb-3 border-b border-gray-200">
          <CardTitle className="text-gray-800 text-[0.95vw] font-medium flex justify-between items-center">
            Weekly Workload {currentMonthData?.monthYear}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setCurrentMonthIndex((prev) => Math.max(0, prev - 1))
                }
                className="p-[0.25vw] bg-gray-100 text-gray-600 rounded-[0.3vw] hover:bg-gray-200 disabled:opacity-50 transition-all"
                disabled={currentMonthIndex === 0}
              >
                <ChevronLeft className="w-[1vw] h-[1vw]" />
              </button>
              <button
                onClick={() =>
                  setCurrentMonthIndex((prev) =>
                    Math.min(monthlyWorkloadData.length - 1, prev + 1)
                  )
                }
                className="p-[0.25vw] bg-gray-100 text-gray-600 rounded-[3px] hover:bg-gray-200 disabled:opacity-50 transition-all"
                disabled={currentMonthIndex === monthlyWorkloadData.length - 1}
              >
                <ChevronRight className="w-[1vw] h-[1vw]" />
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pr-[2vw] mt-[2vw] h-[13.5vw]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentMonthData?.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis
                dataKey="week"
                stroke="#64748b"
                tickFormatter={(week) => `W${week}`}
                fontSize={10}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                labelFormatter={(week) => `Week ${week}`}
                formatter={(value: number, name: string) => [
                  `${value} units`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "3px",
                  fontSize: "10px",
                  padding: "4px",
                }}
                labelStyle={{ color: "#1e293b", fontSize: "10px" }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#2563eb"
                strokeWidth={1.5}
                dot={{ fill: "#2563eb", r: 2 }}
                activeDot={{ r: 3, fill: "#fff", stroke: "#2563eb" }}
              />
              <Line
                type="monotone"
                dataKey="ongoing"
                name="Ongoing"
                stroke="#dc2626"
                strokeWidth={1.5}
                dot={{ fill: "#dc2626", r: 2 }}
                activeDot={{ r: 3, fill: "#fff", stroke: "#dc2626" }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#16a34a"
                strokeWidth={1.5}
                dot={{ fill: "#16a34a", r: 2 }}
                activeDot={{ r: 3, fill: "#fff", stroke: "#16a34a" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
