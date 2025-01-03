"use client"
 
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkloadStatusBar from "./workload-status-bar";

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
    header: "Workload",
    cell: ({ getValue }) => {
      const value = getValue<number>();
      const percentage = value * 10; // Calculate percentage
      return `${percentage}%`; // Display as percentage
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const workload = row.getValue("current_workload") as number;
      return <WorkloadStatusBar value={workload} />;
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
              // You can use the router here if you import it,
              // or pass a handleClick function from the parent
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
