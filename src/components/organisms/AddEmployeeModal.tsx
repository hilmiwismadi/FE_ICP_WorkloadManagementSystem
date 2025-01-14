"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";

interface NewEmployeeData {
  id: string;
  name: string;
  image: string;
  email: string;
  phone: string;
  team: string;
  skill: string;
  role: string;
  current_Workload: number;
  start_Date: string;
}

const TEAM_OPTIONS = ["Pelayanan Pelanggan", "Korporat 1", "Korporat 2"];
const SKILL_OPTIONS = [
  "Backend",
  "Frontend",
  "Full-stack",
  "UI/UX Design",
  "QA",
  "Testing & Acceptance",
  "System Administrator",
  "Data Analyst",
  "Data Engineer",
];
const ROLE_OPTIONS = [
  "Junior Technical",
  "Senior Technical",
  "Lead Technical",
  "Assistant Manager",
  "Manager",
];

export function AddEmployeeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<NewEmployeeData>({
    id: "",
    name: "",
    image: "",
    email: "",
    phone: "",
    team: "",
    skill: "",
    role: "",
    current_Workload: 0.0,
    start_Date: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const validateFormData = () => {
    if (!formData.start_Date) {
      return "Start date is required";
    }
    if (formData.name.length > 30)
      return "Name must be less than 30 characters";
    if (formData.email.length > 30)
      return "Email must be less than 30 characters";
    if (formData.phone.length > 30)
      return "Phone must be less than 30 characters";
    if (formData.team.length > 30)
      return "Team must be less than 30 characters";
    if (formData.skill.length > 30)
      return "Skill must be less than 30 characters";
    if (formData.role.length > 30)
      return "Role must be less than 30 characters";

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateFormData();
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    console.log(formData);
    try {
      const response = await fetch(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add employee");
      }

      setShowConfirmation(false);
      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "Employee added successfully",
        duration: 3000,
      });

      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
        setFormData({
          id: "",
          name: "",
          image: "",
          email: "",
          phone: "",
          team: "",
          skill: "",
          role: "",
          current_Workload: 0.0,
          start_Date: "",
        });
      }, 1500);
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="h-[2.75vw] bg-blue-500 hover:bg-blue-600 text-white text-[0.875vw]">
            <Plus className="mr-[0.5vw]" />
            Add Employee
          </Button>
        </DialogTrigger>
        <DialogContent className="p-[1vw] overflow-hidden rounded-[0.833vw] max-w-[50vw]">
          <form
            onSubmit={handleSubmit}
            className="p-[1.25vw] space-y-[1.25vw] relative"
          >
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="flex flex-col items-center space-y-[1vw]"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 className="w-[4vw] h-[4vw] text-green-500" />
                    </motion.div>
                    <p className="text-[1.2vw] font-semibold text-green-600">
                      Employee added successfully!
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogHeader>
              <DialogTitle className="text-[1.33vw] font-bold pt-[1.25vw]">
                Add New Employee
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-[1.25vw]">
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-[2.5vw] text-[0.8vw]"
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <Input
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  required
                  className="h-[2.5vw] text-[0.8vw]"
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Team <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, team: value }))
                  }
                >
                  <SelectTrigger className="h-[2.5vw] text-[0.8vw]">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_OPTIONS.map((team) => (
                      <SelectItem
                        key={team}
                        value={team}
                        className="text-[0.8vw]"
                      >
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Skill <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, skill: value }))
                  }
                >
                  <SelectTrigger className="h-[2.5vw] text-[0.8vw]">
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_OPTIONS.map((skill) => (
                      <SelectItem
                        key={skill}
                        value={skill}
                        className="text-[0.8vw]"
                      >
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Role <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger className="h-[2.5vw] text-[0.8vw]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className="text-[0.8vw]"
                      >
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-[2.5vw] text-[0.8vw]"
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="h-[2.5vw] text-[0.8vw]"
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="start_Date"
                  value={formData.start_Date}
                  onChange={handleInputChange}
                  className="h-[2.5vw] text-[0.8vw]"
                  required
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  className="h-[2.5vw] text-[0.8vw]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-[0.833vw] pt-[0.833vw]">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-transparent text-[0.8vw]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#38BDF8] hover:bg-[#32a8dd] text-white px-8 text-[0.8vw]"
                disabled={isSubmitting}
              >
                Add Employee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogOverlay className="bg-black/50 fixed inset-0" />
        <AlertDialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[30vw] max-w-none z-50 bg-white rounded-[0.8vw] p-[1.5vw] shadow-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "1vw" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: "1vw" }}
            transition={{ duration: 0.2 }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[1.5vw] font-semibold mb-[1vw]">
                Confirm Employee Addition
              </AlertDialogTitle>
              <div className="space-y-[1vw]">
                <AlertDialogDescription className="text-[1vw]">
                  Please review the employee details below:
                </AlertDialogDescription>
                <motion.div
                  className="space-y-[0.8vw] text-[0.9vw] border rounded-[0.4vw] p-[1vw] bg-gray-50"
                  initial={{ y: "1vw", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div>
                    <strong>Name:</strong> {formData.name}
                  </div>
                  <div>
                    <strong>Employee ID:</strong> {formData.id}
                  </div>
                  <div>
                    <strong>Team:</strong> {formData.team}
                  </div>
                  <div>
                    <strong>Skill:</strong> {formData.skill}
                  </div>
                  <div>
                    <strong>Role:</strong> {formData.role}
                  </div>
                  <div>
                    <strong>Email:</strong> {formData.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {formData.phone}
                  </div>
                  <div>
                    <strong>Start Date:</strong>{" "}
                    {formData.start_Date
                      ? formatDate(formData.start_Date)
                      : "Not specified"}
                  </div>
                </motion.div>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-[1vw]">
              <AlertDialogCancel
                disabled={isSubmitting}
                className="text-[0.8vw]"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmedSubmit}
                disabled={isSubmitting}
                className="bg-[#38BDF8] hover:bg-[#32a8dd] text-[0.8vw]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-[0.417vw]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-[0.833vw] h-[0.833vw] border-[0.417vw] border-white border-t-transparent rounded-full"
                    />
                    Adding...
                  </div>
                ) : (
                  "Confirm Addition"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
