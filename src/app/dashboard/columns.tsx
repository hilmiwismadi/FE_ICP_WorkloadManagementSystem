"use client"
 
import { ColumnDef } from "@tanstack/react-table"
 
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
  },
]