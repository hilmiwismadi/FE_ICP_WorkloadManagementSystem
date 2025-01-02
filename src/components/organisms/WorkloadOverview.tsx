"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Function to calculate bar color based on workload value (0% -> Green, 100% -> Red)
const getBarColor = (value: number): string => {
  // Clamp the value between 0 and 100
  const clampedValue = Math.max(0, Math.min(value, 100));

  if (clampedValue <= 50) {
    // Transition from green (0%) to yellow (50%)
    const greenToYellow = clampedValue / 50; // 0 -> 1 as value goes from 0 to 50
    const red = Math.floor(greenToYellow * 255); // Increase red
    const green = 255; // Full green
    return `rgb(${red}, ${green}, 0)`;
  } else {
    // Transition from yellow (50%) to red (100%)
    const yellowToRed = (clampedValue - 50) / 50; // 0 -> 1 as value goes from 50 to 100
    const red = 255; // Full red
    const green = Math.floor((1 - yellowToRed) * 255); // Decrease green
    return `rgb(${red}, ${green}, 0)`;
  }
};

// Custom progress bar component
const CustomProgressBar = ({ value }: { value: number }) => {
  return (
    <div className="w-full bg-gray-600 rounded-full h-[0.625vw] overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${value}%`, 
          backgroundColor: getBarColor(value), 
          transition: "width 0.3s ease-in-out",
        }}
      />
    </div>
  );
};

export default function WorkloadOverview({ workloadTrend, currentWorkload, averageWorkload }: any) {
  return (
    <div className="space-y-[1.25vw] max-h-screen">
      {/* Workloads Trend Chart */}
      <Card className="bg-[#0A1D56] h-[19vw]">
        <CardHeader>
          <CardTitle className="text-white text-[1.25vw]">Workloads Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[13vw]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workloadTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-[1.25vw] h-[13vw]">
        {/* Current Workloads */}
        <Card className="bg-[#0A1D56] space-y-[4vw] font-semibold">
          <CardHeader>
            <CardTitle className="text-white text-[1.25vw]">Current Workloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-[0.833vw]">
              <div className="w-full">
                <CustomProgressBar value={currentWorkload} />
              </div>
              <p className="text-white text-[1.25vw]">{currentWorkload}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Average Employee Workloads */}
        <Card className="bg-[#0A1D56] space-y-[2vw] font-semibold">
          <CardHeader>
            <CardTitle className="text-white text-[1.25vw]">Average Employee Workloads</CardTitle>
          </CardHeader>
          <CardContent>
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
