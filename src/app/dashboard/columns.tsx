"use client"
 
import { ColumnDef } from "@tanstack/react-table"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
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
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "team",
    header: "Divisi",
  },
  {
    accessorKey: "skill",
    header: "skill",
  },
  {
    accessorKey: "current_workload",
    header: "Workload",
  },
]