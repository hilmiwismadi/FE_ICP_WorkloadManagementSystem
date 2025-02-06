"use client";

import * as React from "react";
import { Search, Check, ChevronDown, X, RefreshCw, ArrowUp, ArrowBigUpDash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  FilterFn,
  useReactTable,
  Row,
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PromotePICModal from "@/components/organisms/AddPICModal";

const TEAM_OPTIONS = ["Pelayanan Pelanggan", "Korporat 1", "Korporat 2"];

type FilterOption = {
  value: string;
  label: string;
  type: "string" | "number";
};

const filterOptions: FilterOption[] = [
  { value: "name", label: "Nama", type: "string" },
];

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

// Define the custom filter function type
const multiSelectFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true;
  const cellValue = row.getValue(columnId);
  return Array.isArray(cellValue)
    ? cellValue.some((val) => filterValue.includes(val))
    : filterValue.includes(cellValue as string);
};

interface ColumnFilterDropdownProps {
  column: any;
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
}

const ColumnFilterDropdown = ({
  column,
  popoverOpen,
  setPopoverOpen,
}: ColumnFilterDropdownProps) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

  // Update selected values when filter value changes
  React.useEffect(() => {
    const currentFilterValue = column.getFilterValue();
    if (currentFilterValue) {
      setSelectedValues(currentFilterValue);
    }
  }, [column]);

  const toggleOption = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    setSelectedValues(newValues);
    column.setFilterValue(newValues.length ? newValues : undefined);
  };

  const clearAll = () => {
    setSelectedValues([]);
    column.setFilterValue(undefined);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "px-0 flex flex-row justify-start items-center h-[2.083vw] border-none hover:bg-gray-100 transition-all duration-200",
            selectedValues.length > 0 && "text-blue-600 font-medium"
          )}
        >
          <span className="mr-[0.521vw] text-[1vw]">Divisi</span>
          {selectedValues.length > 0 && (
            <Badge
              variant="secondary"
              className="rounded-full px-[0.521vw] py-0 text-[0.729vw] font-normal bg-blue-100 text-blue-600"
            >
              {selectedValues.length}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              "h-[1.042vw] w-[1.042vw] ml-[0.521vw] text-[1vw] transition-transform duration-200",
              popoverOpen && "transform rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[14.583vw] p-0" align="start">
        <div className="p-[0.521vw]" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-[0.521vw]">
            {TEAM_OPTIONS.map((option) => {
              const isSelected = selectedValues.includes(option);
              return (
                <div
                  key={option}
                  className={cn(
                    "flex items-center space-x-[0.521vw] p-[0.521vw] rounded-[0.417vw]",
                    "hover:bg-gray-100 transition-colors duration-200",
                    isSelected && "bg-blue-50"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={isSelected}
                      className="rounded-[0.208vw] border-gray-300
                        data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </div>
                  <label
                    htmlFor={option}
                    className="text-[0.833vw] cursor-pointer select-none flex-grow"
                  >
                    {option}
                  </label>
                </div>
              );
            })}
          </div>

          {selectedValues.length > 0 && (
            <div className="border-t mt-[0.521vw] pt-[0.521vw]">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[0.833vw] text-red-600 hover:text-red-700 hover:bg-red-50 
                  transition-colors duration-200 h-[2.083vw]"
                onClick={clearAll}
              >
                <X className="h-[1.042vw] w-[1.042vw] mr-[0.521vw]" />
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export function DataTable<TData>({
  columns,
  data,
  onRefresh,
  isLoading = false,
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [selectedFilter, setSelectedFilter] = React.useState<string>("name");
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const table = useReactTable({
    data,
    columns: columns.map((col) => {
      if (col.id === "team" || (col as any).accessorKey === "team") {
        return {
          ...col,
          id: col.id ?? "team",
          filterFn: multiSelectFilter,
          header: () => (
            <ColumnFilterDropdown
              column={table.getColumn("team")}
              popoverOpen={popoverOpen}
              setPopoverOpen={setPopoverOpen}
            />
          ),
        };
      }
      return col;
    }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    table.getColumn(value)?.setFilterValue("");
  };

  return (
    <div className="flex flex-col flex-grow justify-center items-center">
      <div className="w-full space-y-[1.25vw]">
        <div className="flex items-center space-x-[0.8vw] py-[0.417vw] text-[1.25vw]">
          <div className="relative flex-1">
            <Search className="absolute left-[0.833vw] top-1/2 transform -translate-y-1/2 text-gray-500 h-[1vw] w-[1vw]" />
            <Input
              placeholder={`Search ${
                filterOptions.find((opt) => opt.value === selectedFilter)
                  ?.label || "PIC"
              }...`}
              value={
                (table.getColumn(selectedFilter)?.getFilterValue() as string) ??
                ""
              }
              onChange={(e) =>
                table.getColumn(selectedFilter)?.setFilterValue(e.target.value)
              }
              className="pl-[2.5vw] pr-[2vw] py-[1vw] space-x-[0.2vw] w-full bg-white rounded-[0.417vw]"
            />
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="h-[2.5vw] w-[2.5vw]"
          >
            <RefreshCw
              className={cn(
                "h-[1.25vw] w-[1.25vw]",
                (isRefreshing || isLoading) && "animate-spin"
              )}
            />
          </Button>

          <div className="flex justify-end">
            <Button onClick={handleOpenModal} className="bg-blue-500 flex h-[2.75vw] hover:bg-blue-700">
              <ArrowBigUpDash className="mr-[0.25vw]" />
              Promote PIC
            </Button>
            <PromotePICModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)} 
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[0.417vw] border bg-white p-[1.25vw]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-[2.5vw]">
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
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-[0.4vw] px-[2.5vw]"
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
  );
}
