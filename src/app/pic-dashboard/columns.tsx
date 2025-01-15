"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, ChevronRight, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditEmployeeModal } from "./edit-pic-modal";
import { DeleteConfirmModal } from "./delete-pic-modal";
import { toast } from "@/hooks/use-toast";

export type EmployeeData = {
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  team: string;
  skill: string;
  current_workload: number;
  role: string;
};

export const columns: ColumnDef<EmployeeData>[] = [
  {
    accessorKey: "employee_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nama",
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
    accessorKey: "team",
    header: "Divisi",
  },
  {
    accessorKey: "skill",
    header: "Skill",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);

      return (
        <div className="flex flex-row items-center justify-center gap-x-[0.4vw]">
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditOpen(true)}
            className="hover:bg-gray-300 transition-transform duration-300 hover:scale-125"
          >
            <Pencil className="w-[1vw] h-[1vw] text-blue-500" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteOpen(true)}
            className="hover:bg-gray-300 transition-transform duration-300 hover:scale-125"
          >
            <Trash2 className="w-[1vw] h-[1vw] text-red-500" />
          </Button>

          {/* Edit Modal */}
          <EditEmployeeModal
            employee={employee}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmModal
            employeeId={employee.employee_id}
            employeeName={employee.name}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        </div>
      );
    },
  },
];
