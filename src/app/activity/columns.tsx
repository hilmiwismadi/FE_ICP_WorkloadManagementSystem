"use client"
 
import { ColumnDef } from "@tanstack/react-table"
 
export type TaskData = {
  task_id: string
  name: string
  description: string
  workload: number
  start_date: Date
  end_date: Date
}
 
export const columns: ColumnDef<TaskData>[] = [
  {
    accessorKey: "task_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
  },
  {
    accessorKey: "workload",
    header: "Workload",
  },
  {
    accessorKey: "start_date",
    header: "Memulai",
  },
  {
    accessorKey: "end_date",
    header: "Selesai",
  },
]