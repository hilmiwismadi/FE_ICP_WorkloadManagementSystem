"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { EmployeeData } from "./columns";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface EditEmployeeModalProps {
  employee: EmployeeData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FeedbackState {
  show: boolean;
  success: boolean;
  message: string;
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
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    success: false,
    message: "",
  });
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

      if (!response.ok) throw new Error("Failed to update PIC");

      setFeedback({
        show: true,
        success: true,
        message: "PIC data has been updated successfully",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setFeedback({
        show: true,
        success: false,
        message: "Failed to update PIC data. Please try again.",
      });
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <>
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
                  Edit PIC: {employee.name}
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
                </DialogFooter>
              </form>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback.show && (
          <motion.div
            key="feedback-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-[2vw] right-[2vw] p-[1vw] rounded-lg shadow-lg flex items-center gap-[0.8vw] z-[100]
              ${feedback.success ? 'bg-green-100' : 'bg-red-100'}`}
          >
            {feedback.success ? (
              <CheckCircle2 className={`w-[1.5vw] h-[1.5vw] ${feedback.success ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <AlertCircle className={`w-[1.5vw] h-[1.5vw] ${feedback.success ? 'text-green-600' : 'text-red-600'}`} />
            )}
            <span className={`text-[1vw] ${feedback.success ? 'text-green-800' : 'text-red-800'}`}>
              {feedback.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}