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
import { useParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// Keep existing Task interface
interface Task {
  task_id: string
  description: string
  workload: number
  start_date: Date
  end_date: Date
}

// Keep existing data array
const data: Task[] = [
  {
    task_id: "E001",
    description: "Update client project plans and timelines.",
    workload: 35,
    start_date: new Date("2024-01-10"),
    end_date: new Date("2024-01-15"),
  },
  {
    task_id: "E002",
    description: "Design UI components for the internal dashboard.",
    workload: 25,
    start_date: new Date("2024-01-12"),
    end_date: new Date("2024-01-20"),
  },
  {
    task_id: "E003",
    description: "Refactor backend API to improve performance.",
    workload: 40,
    start_date: new Date("2024-01-15"),
    end_date: new Date("2024-01-25"),
  },
  {
    task_id: "E004",
    description: "Test and debug the new authentication system.",
    workload: 30,
    start_date: new Date("2024-01-18"),
    end_date: new Date("2024-01-30"),
  },
  {
    task_id: "E005",
    description: "Research and integrate a new payment gateway.",
    workload: 20,
    start_date: new Date("2024-01-20"),
    end_date: new Date("2024-01-27"),
  },
  {
    task_id: "E006",
    description: "Create technical documentation for the API.",
    workload: 15,
    start_date: new Date("2024-01-22"),
    end_date: new Date("2024-01-28"),
  },
]


// Modified columns with additional sorting
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "task_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Task ID
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("start_date") as Date
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("end_date") as Date
      return date.toLocaleDateString()
    },
  },
]

export function DataTable() {
  const params = useParams()
  const id = params?.id as string

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  
  React.useEffect(() => {
    if (id) {
      setColumnFilters([
        {
          id: 'task_id',
          value: id
        }
      ])
    }
  }, [id])

  const table = useReactTable({
    data,
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
    // Set default pagination
    initialState: {
      pagination: {
        pageSize: 5,
      },
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
                    <TableHead 
                        key={header.id}
                        className={`text-[0.9vw] h-[0.9vw] ${
                        header.column.id === "description" ? "text-left" : "text-center"
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
                        className={`text-[0.8vw] h-[0.8vw] ${
                        cell.column.id === "description" ? "text-left" : "text-center"
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
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
    </div>
  )
}