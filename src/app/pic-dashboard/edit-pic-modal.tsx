"use client";

import { useState, useEffect } from "react";
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
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

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
  const [isDemotionConfirmOpen, setIsDemotionConfirmOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [managerData, setManagerData] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: employee.email,
    phone: employee.phone,
    team: employee.team,
    role: employee.role,
  });

  useEffect(() => {
    const authToken = Cookies.get("auth_token");
    if (authToken) {
      try {
        const decodedToken: { role: string; user_Id: string } =
          jwtDecode(authToken);
        setUserRole(decodedToken.role);
        if (decodedToken.role === "Manager") {
          setManagerData(decodedToken.user_Id);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

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

  const handleDemotePIC = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/user/updateRole/${managerData}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_Id: employee.employee_id,
            role: "Employee",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to demote employee from PIC");

      toast({
        title: "Success",
        description: "Employee successfully demoted from PIC",
        duration: 3000,
      });
      setIsDemotionConfirmOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to demote employee. Please try again.",
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
                    <SelectItem value="Pelayanan Pelanggan">
                      Pelayanan Pelanggan
                    </SelectItem>
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
                <Button
                  type="button"
                  onClick={() => setIsDemotionConfirmOpen(true)}
                  className="text-[0.9vw] px-[2vw] py-[1vw] bg-red-500 hover:bg-red-600"
                >
                  Demote PIC
                </Button>
              </DialogFooter>
            </form>

            <Dialog
              open={isDemotionConfirmOpen}
              onOpenChange={setIsDemotionConfirmOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Demotion</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to demote this employee from PIC?</p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDemotionConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDemotePIC}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Demoting..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
