import * as React from "react"
import axios from "axios"
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
import { ArrowUpDown, CheckCircle } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
      <div className="flex items-center space-x-2 justify-center">
        <div className="w-28 h-2 bg-gray-200 rounded-full" />
        <span className="text-gray-500 text-sm">Idle</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 justify-center">
      <div className="w-28 h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[0.875vw] text-gray-600">{Number(percentage.toFixed(1))}%</span>
    </div>
  );
};

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
  onTaskUpdate?: () => void
}

// Add this component near the top of the file
const TruncatedText = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div
        className="cursor-pointer truncate max-w-[20vw]"
        onClick={() => setIsOpen(true)}
        title="Click to view full description"
      >
        {text}
      </div>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Full Description</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">
              {text}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export function DataTable({ tasks = [], isLoading = false, onTaskUpdate }: DataTableProps) {
  const [updating, setUpdating] = React.useState<string | null>(null)
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatDateForAPI = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const handleStatusChange = async (task: Task) => {
    try {
      setUpdating(task.task_Id)
      
      const updateData = {
        status: "Complete",
        start_Date: formatDateForAPI(task.start_Date),
        end_Date: formatDateForAPI(task.end_Date),
        description: task.description,
        workload: task.workload,
        type: task.type,
        employee_Id: task.employee_Id,
        user_Id: task.user_Id
      }

      await axios.put(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/edit/${task.task_Id}`,
        updateData
      )
      onTaskUpdate?.()
    } catch (error) {
      console.error("Error updating task status:", error)
    } finally {
      setUpdating(null)
      setSelectedTask(null)
    }
  }

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return <TruncatedText text={description} />;
      },
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
      cell: ({ row }) => {
        const workload = row.getValue("workload") as number
        return <WorkloadStatusBar value={workload} />;
      }
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
        return formatDateForDisplay(row.getValue("start_Date"))
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
        return formatDateForDisplay(row.getValue("end_Date"))
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const task = row.original
        const isOngoing = task.status.toLowerCase() === "ongoing"
        
        return isOngoing ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-[0.8vw] text-green-600 hover:text-green-700 hover:bg-green-50"
                disabled={updating === task.task_Id}
              >
                <CheckCircle className="h-4 w-4" />
                {updating === task.task_Id ? "Updating..." : "Mark Complete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Task Completion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to mark this task as complete?
                  <span className="mt-2 text-sm">
                    <strong>Task:</strong> {task.description}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-[0.8vw]">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleStatusChange(task)}
                  className="bg-green-600 hover:bg-green-700 text-[0.8vw]"
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null
      },
    },
  ]

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    {
      id: "status",
      value: "Ongoing",
    },
  ])

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
                      className={`text-[0.9vw] h-[3vw] ${
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