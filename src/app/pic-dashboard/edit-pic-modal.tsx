"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { EmployeeData } from "./columns";

interface EditEmployeeModalProps {
  employee: EmployeeData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEmployeeModal({
  employee,
  open,
  onOpenChange,
}: EditEmployeeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: employee.email,
    phone: employee.phone,
    team: employee.team,
    role: employee.role,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/update/${employee.employee_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to update employee");

      toast({
        title: "Success",
        description: "Employee data has been updated successfully",
        className: "bg-green-500 text-white",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[40vw]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="space-y-[1.5vw]">
            <DialogHeader>
              <DialogTitle className="text-[2vw] font-bold">
                Edit Employee: {employee.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-[1vw]">
              <div className="grid gap-[0.5vw]">
                <Label htmlFor="team" className="text-[1vw]">
                  Team
                </Label>
                <Select
                  value={formData.team}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, team: value }))
                  }
                >
                  <SelectTrigger className="text-[0.9vw] p-[1vw]">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pelayanan Pelanggan">Pelayanan Pelanggan</SelectItem>
                    <SelectItem value="Korporat 1">Korporat 1</SelectItem>
                    <SelectItem value="Korporat 2">Korporat 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="mt-[2vw]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="text-[0.9vw] px-[2vw] py-[1vw]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="text-[0.9vw] px-[2vw] py-[1vw] bg-blue-500 hover:bg-blue-600"
                >
                  {isLoading ? "Updating..." : "Update Employee"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
