import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
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
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const taskTypes = [
  "Backend",
  "Frontend",
  "Full-stack",
  "UI/UX Design",
  "Unit Testing",
  "Other task...",
];

const taskPriorities = [
  "Normal",
  "Medium",
  "High"
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
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "",
    customType: "",
    workload: 0,
    description: "",
    startDate: "",
    endDate: "",
    priority: "",
  });
  const [isCustomType, setIsCustomType] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
  
      const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("auth_token="))
        ?.split("=")[1];
  
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      const decodedToken: { user_Id: string } = jwtDecode(token);
      const userId = decodedToken.user_Id;
  
      if (!userId) {
        throw new Error("User ID not found in token");
      }
  
      const generateTaskData = (formData: any, params: any, userId: string) => {
        return {
          employee_Ids: [params.id],
          title: formData.type,
          type: isCustomType ? formData.customType : formData.type,
          description: formData.description,
          status: "Ongoing",
          priority: formData.priority,
          workload: formData.workload,
          start_Date: formData.startDate,
          end_Date: formData.endDate
        };
      };
  
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/add/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(generateTaskData(formData, params, userId)),
        }
      );

      console.log(generateTaskData(formData, params, userId));
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }
  
      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "Task assigned successfully",
        duration: 3000,
      });
  
      setTimeout(() => {
        setShowSuccess(false);
        onTaskSubmit();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to assign task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setIsCustomType(value === "Other task...");
    setFormData({
      ...formData,
      type: value === "Other task..." ? "" : value,
      customType: value === "Other task..." ? "" : formData.customType,
    });
  };

  const handleWorkloadChange = (value: number[]) => {
    setFormData({ ...formData, workload: value[0] });
  };

  const handleWorkloadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = parseFloat(value.replace(",", "."));
    
    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 10) {
      setFormData({ ...formData, workload: parsedValue });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="p-[1vw] overflow-hidden rounded-[0.833vw]">
          <form
            onSubmit={handleFormSubmit}
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
                      Task assigned successfully!
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
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
                    </motion.div>
                  )}
                </div>
                
                <div className="space-y-[0.833vw]">
                  <label className="block text-[1vw]">
                    Task Priority <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })} 
                    required
                  >
                    <SelectTrigger className="h-[2.5vw]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskPriorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      onChange={handleWorkloadInputChange}
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
                    className="h-[2.5vw]"
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
        <AlertDialogOverlay className="bg-black/50 fixed inset-0" />
        <AlertDialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[30vw] max-w-none z-50 bg-white rounded-[0.8vw] p-[1.5vw] shadow-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: '1vw' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: '1vw' }}
            transition={{ duration: 0.2 }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[1.5vw] font-semibold mb-[1vw]">
                Confirm Task Assignment
              </AlertDialogTitle>
              <div className="space-y-[1vw]">
                <AlertDialogDescription className="text-[1vw]">
                  Please review the task details below:
                </AlertDialogDescription>
                <motion.div 
                  className="space-y-[0.8vw] text-[0.9vw] border rounded-[0.4vw] p-[1vw] bg-gray-50"
                  initial={{ y: '1vw', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
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
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-[0.833vw] h-[0.833vw] border-[0.417vw] border-white border-t-transparent rounded-full"
                    />
                    Assigning...
                  </div>
                ) : (
                  "Confirm Assignment"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NewTaskModal;