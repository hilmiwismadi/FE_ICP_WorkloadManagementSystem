import * as React from "react";
import { useRouter } from "next/navigation";
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
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowRight, X } from "lucide-react";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// WorkloadStatusBar Component remains the same
const WorkloadStatusBar = ({ value }: { value: number }) => {
  const normalize = value / 13.7;
  const percentage = normalize * 100;

  const getColor = () => {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (value === 0) {
    return (
      <div className="flex items-center space-x-2 justify-center">
        <div className="w-[6vw] h-2 bg-gray-200 rounded-full" />
        <span className="text-gray-500 text-sm">Idle</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 justify-center">
      <div className="w-[6vw] h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[0.875vw] text-gray-600">
        {Number(percentage.toFixed(1))}%
      </span>
    </div>
  );
};

interface Task {
  task_Id: string;
  description: string;
  workload: number;
  start_Date: string;
  end_Date: string;
  employee_Id: string;
  status: string;
  type: string;
  user_Id: string;
  title: string;
}

interface DataTableProps {
  tasks?: Task[];
  isLoading?: boolean;
  onTaskUpdate?: () => void;
}

export function DataTable({
  tasks = [],
  isLoading = false,
  onTaskUpdate,
}: DataTableProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [fullDescription, setFullDescription] = useState("");

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const openModal = (description: string) => {
    setFullDescription(description);
    setModalOpen(true);
  };

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        return <div className="text-[0.8vw]">{row.getValue("title") as string}</div>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        const limitedDescription =
          description.split(" ").slice(0, 20).join(" ") +
          (description.split(" ").length > 100 ? "..." : "");
        return (
          <div className="max-h-[5vw] min-w-[20vw] text-[0.8vw] overflow-hidden text-ellipsis">
            {limitedDescription}
            {description.split(" ").length > 20 && (
              <button
                onClick={() => openModal(description)}
                className="text-blue-500 ml-[0.5vw]"
              >
                Read More
              </button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return <div className="text-[0.8vw]">{type}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div
            className={`
            px-2 py-[0.1vw] rounded-full text-center text-[0.7vw] w-fit mx-auto
            ${
              status.toLowerCase() === "done"
                ? "bg-blue-100 text-blue-800"
                : status.toLowerCase() === "complete"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }
          `}
          >
            {status}
          </div>
        );
      },
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
        );
      },
      cell: ({ row }) => {
        const workload = row.getValue("workload") as number;
        return <WorkloadStatusBar value={workload} />;
      },
    },
    {
      accessorKey: "start_Date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-[0.8vw] p-[0vw]"
          >
            Start Date
            <ArrowUpDown className="text-[0.8vw] ml-[0.417vw] h-[0.833vw] w-[0.833vw]" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-[0.8vw]">{formatDateForDisplay(row.getValue("start_Date"))}</div>;
      },
    },
    {
      accessorKey: "end_Date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-[0.8vw] p-[0vw]"
          >
            End Date
            <ArrowUpDown className="text-[0.8vw] ml-[0.417vw] h-[0.833vw] w-[0.833vw]" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-[0.8vw]">{formatDateForDisplay(row.getValue("end_Date"))}</div>;
      },
    },
    {
      id: "actions",
      header: () => {
        return <div className="w-full text-[0.8vw] flex align-center justify-center">Actions</div>;
      },
      cell: ({ row }) => {
        const task = row.original;
        const isDone = task.status.toLowerCase() === "done";

        return isDone ? (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-[0.8vw] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => router.push(`/task/details/${task.task_Id}`)}
          >
            <ArrowRight className="h-4 w-4" />
            View Details
          </Button>
        ) : null;
      },
    },
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    {
      id: "status",
      value: "Done",
    },
  ]);

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
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  return (
    <>
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
                          [
                            "status",
                            "workload",
                            "start_Date",
                            "end_Date",
                            "actions"
                          ].includes(header.column.id)
                            ? "pl-[1vw] pr-[1vw] text-center text-[0.8vw]"
                            : "pl-[1vw] pr-[3vw] text-[0.8vw]"
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
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
                          [
                            "status",
                            "workload",
                            "start_Date",
                            "end_Date",
                            "actions"
                          ].includes(cell.column.id)
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

      {/* Modal for full description */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-[0.3vw] p-4 max-w-[40vw] w-full shadow-lg relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold pb-2 border-b border-gray-300">
              Full Description
            </h2>
            <h3 className="text-[0.8vw] mt-4 text-gray-800">{fullDescription}</h3>
          </div>
        </div>
      )}
    </>
  );
}