import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
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

// Interface for the task data
interface Task {
  task_Id: string
  description: string
  workload: number
  start_Date: string
  end_Date: string
  employee_Id: string
  status: string
  type: string
  user_Id: string
}

interface DataTableProps {
  tasks?: Task[]
  isLoading?: boolean
}

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className={`
          px-2 py-1 rounded-full text-center text-[0.7vw] w-fit mx-auto
          ${status.toLowerCase() === 'ongoing' ? 'bg-blue-100 text-blue-800' : 
            status.toLowerCase() === 'complete' ? 'bg-green-100 text-green-800' : 
            'bg-gray-100 text-gray-800'}
        `}>
          {status}
        </div>
      )
    }
  },
  {
    accessorKey: "workload",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-[0.8vw]"
        >
          Workload
          <ArrowUpDown className="text-[0.8vw] ml-[0.417vw] h-[0.833vw] w-[0.833vw]" />
        </Button>
      )
    },
  },
  {
    accessorKey: "start_Date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-[0.8vw]"
        >
          Start Date
          <ArrowUpDown className="text-[0.8vw] ml-[0.417vw] h-[0.833vw] w-[0.833vw]" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("start_Date"))
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "end_Date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-[0.8vw]"
        >
          End Date
          <ArrowUpDown className="text-[0.8vw] ml-[0.417vw] h-[0.833vw] w-[0.833vw]" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("end_Date"))
      return date.toLocaleDateString()
    },
  },
]

export function DataTable({ tasks = [], isLoading = false }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  if (isLoading) {
    return <div className="text-center py-4">Loading tasks...</div>
  }

  return (
    <div className="w-full">
      <div className="border bg-gray-50 rounded-[1vw]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id}
                      className={`text-[0.9vw] h-[0.8vw] ${
                        ["status", "workload", "start_Date", "end_Date"].includes(header.column.id)
                          ? "pl-[1vw] pr-[1vw] text-center"
                          : "pl-[1vw] pr-[3vw]" 
                      }`}
                    >
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
                    <TableCell
                      key={cell.id}
                      className={`text-[0.9vw] h-[0.8vw] ${
                        ["status", "workload", "start_Date", "end_Date"].includes(cell.column.id)
                          ? "px-[1vw] py-[0.5vw] text-center"
                          : "px-[1vw] py-[0.5vw]" 
                      }`}
                    >
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
                  className="h-[5vw] text-left"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-y-[1.5vw]">
        <div className="text-[0.729vw] text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-[0.417vw]">
          <Button
            variant="outline"
            size="default"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-[0.729vw] h-[2.5vw] px-[1.25vw] rounded-[0.5vw] border border-gray-300"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-[0.729vw] h-[2.5vw] px-[1.25vw] rounded-[0.5vw] border border-gray-300"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}