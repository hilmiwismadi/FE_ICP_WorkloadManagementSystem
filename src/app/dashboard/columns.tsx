"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { ChevronRight, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// WorkloadStatusBar Component
const WorkloadStatusBar = ({ value }: { value: number }) => {
  const normalize = value / 15;
  const percentage = normalize * 100;
  
  const getColor = () => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (value === 0) {
    return (
      <div className="flex items-center space-x-2 justify-start">
        <div className="w-full h-2 bg-gray-200 rounded-full" />
        <span className="text-gray-500 text-sm">Idle</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 justify-start">
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600">{Number(percentage.toFixed(1))}%</span>
    </div>
  );
};

export type EmployeeData = {
  employee_id: string
  name: string
  email: string
  phone: string
  team: string
  skill: string
  current_workload: number
}
 
export const columns: ColumnDef<EmployeeData>[] = [
  {
    accessorKey: "employee_id",
    header: "ID",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "phone",
    header: "Contact",
  },
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "team",
    header: "Divisi",
  },
  {
    accessorKey: "skill",
    header: "Skill",
  },
  {
    accessorKey: "current_workload",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="text-[1vw] px-0"
        >
          Workload
          <ArrowUpDown className="text-[1vw] ml-[0.417vw] h-[0.833vw] w-[0.833vw]" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const workload = row.getValue("current_workload") as number;
      return <WorkloadStatusBar value={workload} />;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = rowA.getValue(columnId) as number;
      const valueB = rowB.getValue(columnId) as number;
      return valueA - valueB;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-navy hover:bg-blue-500 w-[2vw] h-[2vw]"
            onClick={(e) => {
              e.stopPropagation();
              const employeeId = row.original.employee_id;
              window.location.href = `/profile/${employeeId}`;
            }}
          >
            <ChevronRight className="h-[1vw] w-[1vw] text-white" />
          </Button>
        </div>
      );
    },
  },
];