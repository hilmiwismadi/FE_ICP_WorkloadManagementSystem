// components/data-table.tsx
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// Define the Task type
interface Task {
  task_id: string
  name: string
  description: string
  workload: number
  start_date: Date
  end_date: Date
}

// Sample data
const data: Task[] = [
  {
    task_id: "12003",
    name: "Attaqi Sarjiman Wismadi",
    description: "Monitoring vendor APKT",
    workload: 7.5,
    start_date: new Date(2024, 0, 1),
    end_date: new Date(2024, 0, 7),
  },
  {
    task_id: "12003",
    name: "Attaqi Sarjiman Wismadi",
    description: "Monitoring vendor APKT",
    workload: 7.5,
    start_date: new Date(2024, 0, 1),
    end_date: new Date(2024, 0, 7),
  },
  {
    task_id: "12004",
    name: "Rizki Fauzan",
    description: "Developing new feature for app",
    workload: 10,
    start_date: new Date(2024, 0, 5),
    end_date: new Date(2024, 0, 12),
  },
  {
    task_id: "12005",
    name: "Lina Salsabila",
    description: "Research on competitor products",
    workload: 6,
    start_date: new Date(2024, 0, 3),
    end_date: new Date(2024, 0, 8),
  },
  {
    task_id: "12006",
    name: "Budi Santoso",
    description: "Update the backend server",
    workload: 8,
    start_date: new Date(2024, 0, 4),
    end_date: new Date(2024, 0, 10),
  },
  {
    task_id: "12007",
    name: "Mira Ningsih",
    description: "UI/UX design for new website",
    workload: 9,
    start_date: new Date(2024, 0, 6),
    end_date: new Date(2024, 0, 13),
  },
  {
    task_id: "12008",
    name: "Joko Prasetyo",
    description: "Bug fixing for mobile app",
    workload: 7,
    start_date: new Date(2024, 0, 2),
    end_date: new Date(2024, 0, 8),
  },
  {
    task_id: "12009",
    name: "Dian Amalia",
    description: "Code review for new features",
    workload: 6.5,
    start_date: new Date(2024, 0, 9),
    end_date: new Date(2024, 0, 15),
  },
  {
    task_id: "12010",
    name: "Farhan Hidayat",
    description: "Database migration",
    workload: 12,
    start_date: new Date(2024, 0, 10),
    end_date: new Date(2024, 0, 17),
  },
  {
    task_id: "12011",
    name: "Indah Wulandari",
    description: "Marketing campaign planning",
    workload: 8,
    start_date: new Date(2024, 0, 11),
    end_date: new Date(2024, 0, 18),
  },
  {
    task_id: "12012",
    name: "Fajar Setiawan",
    description: "Test automation setup",
    workload: 7,
    start_date: new Date(2024, 0, 12),
    end_date: new Date(2024, 0, 19),
  },
  {
    task_id: "12013",
    name: "Rita Pramudita",
    description: "Customer support system improvement",
    workload: 5,
    start_date: new Date(2024, 0, 14),
    end_date: new Date(2024, 0, 20),
  },
  {
    task_id: "12014",
    name: "Arif Budiman",
    description: "Cloud infrastructure setup",
    workload: 10,
    start_date: new Date(2024, 0, 15),
    end_date: new Date(2024, 0, 22),
  },
  {
    task_id: "12015",
    name: "Siti Rahmawati",
    description: "SEO optimization for website",
    workload: 6,
    start_date: new Date(2024, 0, 16),
    end_date: new Date(2024, 0, 23),
  },
  {
    task_id: "12016",
    name: "Wahyu Pratama",
    description: "Mobile app performance tuning",
    workload: 7.5,
    start_date: new Date(2024, 0, 17),
    end_date: new Date(2024, 0, 24),
  },
  {
    task_id: "12017",
    name: "Alya Putri",
    description: "Designing marketing materials",
    workload: 9,
    start_date: new Date(2024, 0, 18),
    end_date: new Date(2024, 0, 25),
  },
  {
    task_id: "12018",
    name: "Kiki Saputra",
    description: "Web scraping for data analysis",
    workload: 8,
    start_date: new Date(2024, 0, 19),
    end_date: new Date(2024, 0, 26),
  },
  {
    task_id: "12019",
    name: "Zahra Amalia",
    description: "User feedback analysis",
    workload: 6.5,
    start_date: new Date(2024, 0, 20),
    end_date: new Date(2024, 0, 27),
  },
  {
    task_id: "12020",
    name: "Yusuf Hendra",
    description: "API integration with third-party services",
    workload: 10,
    start_date: new Date(2024, 0, 21),
    end_date: new Date(2024, 0, 28),
  },
  {
    task_id: "12021",
    name: "Nina Susanti",
    description: "Social media content strategy",
    workload: 7,
    start_date: new Date(2024, 0, 22),
    end_date: new Date(2024, 0, 29),
  },
  {
    task_id: "12022",
    name: "Bram Dwi",
    description: "User onboarding process improvement",
    workload: 7.5,
    start_date: new Date(2024, 0, 23),
    end_date: new Date(2024, 0, 30),
  },
]

// Define columns
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "task_id",
    header: "Task ID",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "workload",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Workload
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.getValue("start_date") as Date
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.getValue("end_date") as Date
      return date.toLocaleDateString()
    },
  },
]

export function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}