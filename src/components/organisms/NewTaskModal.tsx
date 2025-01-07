"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/alert-dialog";

const taskTypes = [
  "Backend",
  "Frontend",
  "Full-stack",
  "UI/UX Design",
  "Unit Testing",
  "Other task...",
];

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  onTaskSubmit: () => void;
}

export const NewTaskModal = ({
  open,
  onClose,
  onTaskSubmit,
}: NewTaskModalProps) => {
  const params = useParams();
  const [formData, setFormData] = useState({
    type: "",
    customType: "",
    workload: 0,
    description: "",
    startDate: "",
    endDate: "",
  });
  const [isCustomType, setIsCustomType] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const userId = userData.user_Id;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const generateTaskData = (formData: any, params: any, userId: string) => {
        return {
          task_Id: undefined,
          type: formData.type,
          description: formData.description,
          status: "Ongoing",
          workload: formData.workload,
          start_Date: formData.startDate,
          end_Date: formData.endDate,
          employee_Id: params.id,
        };
      };

      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/add/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(generateTaskData(formData, params, userId)),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      onTaskSubmit();
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handleWorkloadChange = (value: number[]) => {
    setFormData({ ...formData, workload: value[0] });
  };

  const handleTypeChange = (value: string) => {
    setIsCustomType(value === "Other task...");
    setFormData({
      ...formData,
      type: value === "Other task..." ? "" : value,
      customType: value === "Other task..." ? "" : formData.customType,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="p-[1vw] overflow-hidden rounded-[0.833vw]">
          <form
            onSubmit={handleFormSubmit}
            className="p-[1.25vw] space-y-[1.25vw]"
          >
            <DialogTitle className="text-[1.33vw] font-bold pt-[1.25vw]">
              Add new task
            </DialogTitle>
            <div className="grid grid-cols-2 gap-[1.25vw]">
              {/* Left Column */}
              <div className="space-y-[2vw]">
                <div className="space-y-[0.833vw]">
                  <label className="block text-[1vw]">
                    Task Type <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={handleTypeChange} required>
                    <SelectTrigger className="h-[2.5vw]">
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCustomType && (
                    <Input
                      value={formData.customType}
                      onChange={(e) => {
                        const customValue = e.target.value;
                        setFormData({
                          ...formData,
                          customType: customValue,
                          type: customValue, 
                        });
                      }}
                      placeholder="Enter custom task type"
                      className="h-[2.5vw] mt-[0.417vw]"
                      required
                    />
                  )}
                </div>

                <div className="space-y-[0.417vw]">
                  <label className="block text-[1vw]">
                    Task Workload (0-10) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-[0.833vw] items-center">
                    <div className="flex-grow">
                      <Slider
                        value={[formData.workload]}
                        onValueChange={handleWorkloadChange}
                        max={10}
                        step={0.1}
                        className="py-[0.833vw]"
                      />
                    </div>
                    <Input
                      type="number"
                      value={formData.workload}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0 && value <= 10) {
                          setFormData({ ...formData, workload: value });
                        }
                      }}
                      className="w-[4.1vw] h-[2.5vw] px-[0.625vw]"
                      step="0.1"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-[2vw]">
                <div className="space-y-[0.833vw]">
                  <label className="block text-[1vw]">
                    Task Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="h-[2.5vw]"
                    required
                  />
                </div>

                <div className="space-y-[0.417vw]">
                  <label className="block text-[1vw]">
                    Task End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="space-y-[0.417vw]">
              <label className="block text-[1vw]">
                Task Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter Task Description"
                className={cn(
                  "w-full min-h-[6.25vw] px-[0.833vw] py-[0.625vw] rounded-lg border border-gray-200",
                  "resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                )}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-[0.833vw] pt-[0.833vw]">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#38BDF8] hover:bg-[#32a8dd] text-white px-8"
                disabled={isSubmitting}
              >
                Assign
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Task Assignment</AlertDialogTitle>
            <div className="space-y-4">
              <AlertDialogDescription>
                Are you sure you want to assign this task?
              </AlertDialogDescription>
              <div className="space-y-2 text-sm border rounded-md p-3 bg-gray-50">
                <div>
                  <strong>Type:</strong>{" "}
                  {isCustomType ? formData.customType : formData.type}
                </div>
                <div>
                  <strong>Description:</strong> {formData.description}
                </div>
                <div>
                  <strong>Workload:</strong> {formData.workload}
                </div>
                <div>
                  <strong>Start Date:</strong> {formatDate(formData.startDate)}
                </div>
                <div>
                  <strong>End Date:</strong> {formatDate(formData.endDate)}
                </div>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting} className="text-[0.8vw]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedSubmit}
              disabled={isSubmitting}
              className="bg-[#38BDF8] hover:bg-[#32a8dd] text-[0.8vw]"
            >
              {isSubmitting ? "Assigning..." : "Confirm Assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NewTaskModal;
