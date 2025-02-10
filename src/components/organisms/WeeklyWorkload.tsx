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

interface WeeklyWorkloadProps {
  monthlyWorkloadData: {
    monthYear: string;
    weeklyData: {
      week: number;
      total: number;
      ongoing: number;
      completed: number;
    }[];
  }[];
}

const WeeklyWorkload: React.FC<WeeklyWorkloadProps> = ({ monthlyWorkloadData }) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.toLocaleString("default", {
      month: "long",
    })} ${currentDate.getFullYear()}`;
    return Math.max(
      0,
      monthlyWorkloadData.findIndex(
        (data) => data.monthYear === currentMonthYear
      )
    );
  });

  const currentMonthData = monthlyWorkloadData[currentMonthIndex];

  return (
    <Card className="bg-white shadow-sm rounded-[0.3vw]">
      <CardHeader className="pb-3 border-b border-gray-200">
        <CardTitle className="text-gray-800 text-sm font-medium flex justify-between items-center">
          <span>Weekly Workload {currentMonthData?.monthYear}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
              className="p-1.5 bg-gray-100 text-gray-600 rounded-[0.3vw] hover:bg-gray-200 disabled:opacity-50 transition-all"
              disabled={currentMonthIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setCurrentMonthIndex((prev) =>
                  Math.min(monthlyWorkloadData.length - 1, prev + 1)
                )
              }
              className="p-1.5 bg-gray-100 text-gray-600 rounded-[0.3vw] hover:bg-gray-200 disabled:opacity-50 transition-all"
              disabled={currentMonthIndex === monthlyWorkloadData.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[280px] px-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentMonthData?.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis
              dataKey="week"
              stroke="#64748b"
              tickFormatter={(week) => `Week ${week}`}
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              labelFormatter={(week) => `Week ${week}`}
              formatter={(value: number, name: string) => [
                `${value} Workload Units`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "3px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#1e293b" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", strokeWidth: 2 }}
              activeDot={{ r: 4, fill: "#fff", stroke: "#2563eb" }}
            />
            <Line
              type="monotone"
              dataKey="ongoing"
              name="Ongoing"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ fill: "#dc2626", strokeWidth: 2 }}
              activeDot={{ r: 4, fill: "#fff", stroke: "#dc2626" }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ fill: "#16a34a", strokeWidth: 2 }}
              activeDot={{ r: 4, fill: "#fff", stroke: "#16a34a" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyWorkload;
