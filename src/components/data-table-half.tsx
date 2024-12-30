"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  FilterFn,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterOption = {
  value: string;
  label: string;
  type: "string" | "number";
};

const filterOptions: FilterOption[] = [
  { value: "task_id", label: "Task_ID", type: "string" },
  { value: "name", label: "Name", type: "string" },
  { value: "description", label: "Deskripsi", type: "string" },
  { value: "current_workload", label: "Current Workload", type: "number" },
];

const workloadFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const rowValue = row.getValue(columnId);

  // Handle empty filter value
  if (filterValue === "") return true;

  // Convert filter value to number
  const numericFilterValue = Number(filterValue);
  if (isNaN(numericFilterValue)) return true;

  // Check if rowValue is a valid number
  if (typeof rowValue !== "number") return false;

  return rowValue <= numericFilterValue;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTableHalf<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [activeTab, setActiveTab] = React.useState<"ongoing" | "history">(
    "ongoing"
  );
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [selectedFilter, setSelectedFilter] = React.useState<string>("name");

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    pageCount: Math.ceil(data.length / pageSize),
    manualPagination: false,
  });

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    // Clear the previous filter value when changing columns
    table.getColumn(value)?.setFilterValue("");
  };

  // Get the current filter option
  const currentFilterOption = filterOptions.find(
    (option) => option.value === selectedFilter
  );

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const column = table.getColumn(selectedFilter);

    if (!column) return;

    if (selectedFilter === "current_workload") {
      // For workload, use custom filter
      column.setFilterValue(value === "" ? "" : Number(value));
    } else {
      // For other columns, use default string filter
      column.setFilterValue(value);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="w-[80vw] h-[100vh]">
        {/* Search and Filter Section */}
        <div className="flex items-center space-x-2 py-[1vw] text-[1.25vw] ">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-[1vw] top-1/2 transform -translate-y-1/2 text-gray-500 h-[1vw] w-[1vw]" />
            <Input
              placeholder={`Search ${
                currentFilterOption?.label || "Employee"
              }...`}
              value={
                (table.getColumn(selectedFilter)?.getFilterValue() as string) ??
                ""
              }
              onChange={handleInputChange}
              type={currentFilterOption?.type === "number" ? "number" : "text"}
              className="pl-[2vw] pr-[2vw] py-[1vw] w-full bg-gray-100 rounded-lg"
            />
          </div>

          {/* Filter Dropdown */}
          <Select value={selectedFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[16vw] bg-gray-100">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Info Section */}
        <div className="bg-[#15234A] rounded-[0.8vw] text-white mb-[1vw] py-[1vw] ">
          <div className="flex items-center mx-[2vw] mb-[1vw]">
            <div className="flex items-center gap-[2vw]">
              <img
                src="/api/placeholder/100/100"
                alt="User Avatar"
                className="rounded-full w-[7vw] h-[7vw]"
              />
              <div>
                <h2 className="text-[2vw] font-semibold">
                  Varick Zahir Sarjiman
                </h2>
                <p className="text-[1vw] text-gray-300">ID-12003</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[1vw] text-gray-300">
                varickzahirsarjiman@mail.ugm.ac.id
              </p>
              <p className="text-[1vw] text-gray-300">+62 812-1212-1212</p>
            </div>
          </div>

          <div className="flex mx-[2vw] gap-[2vw] text-[1.1vw]">
            <div className="flex justify-center items-center w-[8/12] gap-[0.3vw]">
              <p className="text-gray-400 text-[1vw]">Team : </p>
              <p className="text-[1vw]">
                Aplikasi Penanganan Pengaduan Keluhan dan Gangguan Pelanggan
              </p>
            </div>
            <div className="flex justify-center items-center w-[4/12] gap-[0.3vw]">
              <p className="text-gray-400 text-[1vw]">Role :</p>
              <p className="text-[1vw]">Backend Engineer</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-[1vw] w-full">
          <button
            className={`px-[3vw] py-[0.3vw] text-[1vw] font-medium w-6/12 ${
              activeTab === "ongoing"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("ongoing")}
          >
            On Going
          </button>
          <button
            className={`px-[3vw] py-[0.3vw] text-[1vw] font-medium w-6/12 ${
              activeTab === "history"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>

        {/* Table */}
        <div className="rounded-[0.8vw] border ">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-[1vw]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
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
                      <TableCell key={cell.id} className="text-[0.85vw]">
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
                    className="h-[12vw] text-center text-[1vw]"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-[1vw] mt-[1vw]">
          <div className="flex-1 text-[1vw] text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-[1vw]"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-[1vw]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
