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

// Define the filter options type
type FilterOption = {
  value: string;
  label: string;
  type: "string" | "number";
};

const filterOptions: FilterOption[] = [
  { value: "employee_id", label: "Employee ID", type: "string" },
  { value: "name", label: "Name", type: "string" },
  { value: "email", label: "Email", type: "string" },
  { value: "phone", label: "Phone", type: "string" },
  { value: "team", label: "Team", type: "string" },
  { value: "skill", label: "Skill", type: "string" },
  { value: "current_workload", label: "Current Workload", type: "number" },
];

// Custom filter function for workload
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

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [selectedFilter, setSelectedFilter] = React.useState<string>("name");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      workload: workloadFilter,
    },
    state: {
      columnFilters,
    },
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
    <>
      <div className="flex flex-col justify-center items-center w-full">
        <div className="w-[78.333vw] ">
          {/* Search and Filter Section */}
          <div className="flex items-center space-x-2 py-[2vw] text-[1.25vw] ">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-[1vw] top-1/2 transform -translate-y-1/2 text-gray-500 h-[1vw] w-[1vw]" />
              <Input
                placeholder={`Search ${
                  currentFilterOption?.label || "Employee"
                }...`}
                value={
                  (table
                    .getColumn(selectedFilter)
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={handleInputChange}
                type={
                  currentFilterOption?.type === "number" ? "number" : "text"
                }
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

          {/* Table */}
          <div className="rounded-md border aspect-[1312/600]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
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
                      className="flex-row items-center"
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
                      className="h-[6vw] text-center text-[1.25vw]"
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
    </>
  );
}
