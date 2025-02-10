import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell } from "recharts";

const GaugeChart = ({ value }: { value: number }) => {
  const percentage = Math.min(100, Math.max(0, value));

  // Calculate color based on percentage
  const getGaugeColor = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(value, 100));
    return clampedValue <= 50
      ? `rgb(${Math.floor((clampedValue / 50) * 255)}, 255, 0)`
      : `rgb(255, ${Math.floor((1 - (clampedValue - 50) / 50) * 255)}, 0)`;
  };

  const data = [
    { name: "progress", value: percentage },
    { name: "remaining", value: 100 - percentage },
  ];

  return (
    <div className="relative w-full h-full mx-auto">
      <PieChart width={180} height={100}>
        <Pie
          data={data}
          cx={100}
          cy={90}
          startAngle={180}
          endAngle={0}
          innerRadius={50}
          outerRadius={70}
          paddingAngle={0}
          dataKey="value"
        >
          <Cell fill={getGaugeColor(percentage)} />
          <Cell fill="#e5e7eb" />
        </Pie>
      </PieChart>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ top: "80%", transform: "translateY(-30%)" }}
      >
        <span className="font-bold text-2xl text-gray-700">{percentage}%</span>
      </div>
    </div>
  );
};

interface CurrentAndAverageWorkloadProps {
  currentWorkload: number;
  averageWorkload: number;
}

const CurrentAndAverageWorkload: React.FC<CurrentAndAverageWorkloadProps> = ({
  currentWorkload,
  averageWorkload,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
      <Card className="flex-1 bg-white shadow-sm rounded-[0.3vw] max-w-sm">
        <CardHeader className="pb-3 border-b border-gray-200">
          <CardTitle className="text-gray-800 text-[0.95vw] font-semibold">
            Current Workload
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <GaugeChart value={currentWorkload} />
        </CardContent>
      </Card>

      <Card className="flex-1 bg-white shadow-sm rounded-[0.3vw] max-w-sm">
        <CardHeader className="pb-3 border-b border-gray-200">
          <CardTitle className="text-gray-800 text-[0.95vw] font-semibold">
            Average Employee Workload
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <GaugeChart value={averageWorkload} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrentAndAverageWorkload;
