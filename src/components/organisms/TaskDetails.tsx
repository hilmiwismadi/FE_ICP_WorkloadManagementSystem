import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Activity,
  AlertTriangle,
  Clock,
  UserPlus,
  X,
  Check,
  AlertCircle,
  Loader,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  team?: string;
  skill?: string;
  phone?: string;
  current_Workload: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  workload: string;
  urgency: string;
  status: string;
  assigns?: Array<{
    employee_Id: string;
    employee: Employee;
  }>;
}

interface TaskAssign {
  employee: Employee; // Assuming Employee is already defined
}

interface TaskDetailsProps {
  selectedTask: Task | null;
  onStatusUpdate: (
    taskId: string,
    newStatus: "Ongoing" | "Done" | "Approved"
  ) => void;
  onClose: () => void;
  showStatusButtons: boolean;
}

const calculateWorkloadPercentage = (workload: number): number => {
  const normalize = Math.round((workload / 10.7) * 100);
  return normalize;
};

const getWorkloadColor = (percentage: number): string => {
  if (percentage < 40) {
    return "text-green-600";
  } else if (percentage < 80) {
    return "text-yellow-600";
  } else {
    return "text-red-600";
  }
};

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ";
  }
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads")) {
    return `https://be-icpworkloadmanagementsystem.up.railway.app/api${imageUrl}`;
  }
  return imageUrl;
};

export const TaskDetails = ({
  selectedTask: initialTask,
  onStatusUpdate,
  onClose,
  showStatusButtons,
}: TaskDetailsProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"Ongoing" | "Done" | null>(
    null
  );
  const { toast } = useToast();
  const router = useRouter();
  const [hoverCardPosition, setHoverCardPosition] = useState<
    Record<string, string>
  >({});
  const [taskData, setTaskData] = useState<Task | null>(initialTask);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [statusUpdateResult, setStatusUpdateResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!initialTask?.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/read/${initialTask.id}`
        );
        const result = await response.json();

        if (result.data) {
          // Transform the data to match our Task interface
          const transformedTask = {
            ...result.data,
            id: result.data.task_Id,
            startDate: new Date(result.data.start_Date),
            endDate: new Date(result.data.end_Date),
            urgency: result.data.priority,
            workload: result.data.workload.toString(),
            assigns: result.data.assigns || [],
          };
          setTaskData(transformedTask);
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [initialTask?.id]);

  const handleStatusChange = (newStatus: "Ongoing" | "Done") => {
    // Don't allow status change if current status is 'Approved'
    if (taskData?.status === "Approved") {
      toast({
        title: "Cannot modify approved tasks",
        description: "This task has been approved and cannot be modified.",
        variant: "destructive",
      });
      return;
    }

    setPendingStatus(newStatus);
    setShowConfirmation(true);
  };

  const handleConfirmedStatusChange = async () => {
    if (!taskData || !pendingStatus) return;

    setIsSubmitting(true);
    setStatusUpdateResult(null);

    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/edit/status/${taskData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: pendingStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      toast({
        title: "Success!",
        description: `Task status updated to ${pendingStatus}`,
        duration: 3000,
      });

      // Notify parent component of the status update
      if (onStatusUpdate) {
        onStatusUpdate(
          taskData.id,
          pendingStatus as "Ongoing" | "Done" | "Approved"
        );
      }
      setStatusUpdateResult({
        success: true,
        message: `Task status updated to ${pendingStatus}`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      setStatusUpdateResult({
        success: false,
        message: "Failed to update task status. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setShowConfirmation(false);
        setStatusUpdateResult(null);
        setTaskData(null);
      }, 500);
    }
  };

  const renderAssigneeImages = (assigns: TaskAssign[]) => {
    if (!assigns || assigns.length === 0) {
      return null;
    }

    return assigns.map((assign, index) => {
      const employee = assign.employee;
      const image = getImageUrl(employee.image);

      return (
        <div
          key={employee.employee_Id}
          className="relative group"
          onMouseEnter={(event) => {
            const card = event.currentTarget.querySelector(".hover-card");
            if (card) {
              const rect = card.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              const spaceAbove = rect.top;

              const employeeId = employee.employee_Id as string;
              if (spaceBelow < rect.height && spaceAbove > rect.height) {
                setHoverCardPosition((prev) => ({
                  ...prev,
                  [employeeId]: "above",
                }));
              } else {
                setHoverCardPosition((prev) => ({
                  ...prev,
                  [employeeId]: "below",
                }));
              }
            }
          }}
        >
          <div className="w-[2.5vw] h-[2.5vw] rounded-full bg-gray-200 border-[0.08vw] border-white flex items-center justify-center overflow-hidden">
            <Image
              src={image}
              alt={employee.name || `Employee ${index + 1}`}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Hover Card */}
          <motion.div
            className={`absolute z-50 right-0 transform -translate-x-full 
              ${
                hoverCardPosition[employee.employee_Id] === "above"
                  ? "bottom-full mb-2"
                  : "top-full mt-2"
              } 
              w-[12vw] bg-white rounded-lg shadow-lg p-[0.625vw] hidden group-hover:block z-50 border border-gray-200 hover-card`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-start gap-[0.625vw]">
              <Image
                src={image}
                alt={employee.name}
                width={32}
                height={32}
                className="w-[2.5vw] h-[2.5vw] rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-[0.9vw]">
                  {employee.name}
                </h4>
              </div>
            </div>
            <div className="mt-[0.5vw] space-y-[0.25vw] text-[0.6vw]">
              <div className="flex justify-between">
                <span className="text-gray-500">Team:</span>
                <span className="text-gray-900">{employee.team}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role:</span>
                <span className="text-gray-900">{employee.skill}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Workload:</span>
                <span className={`${getWorkloadColor(employee.current_Workload)}`}>
                  {calculateWorkloadPercentage(employee.current_Workload)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="text-gray-900">{employee.phone}</span>
              </div>
            </div>
          </motion.div>
        </div>
      );
    });
  };

  const handleClose = () => {
    setTaskData(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[35vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500 mb-2" />
        <span className="text-gray-600 text-[0.7vw]">
          Loading, please wait . . .
        </span>
      </div>
    );
  }

  if (!taskData) {
    return null;
  }

  return (
    <>
      <div className="p-6 border rounded-lg bg-white w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-row items-center justify-start gap-[1vw] mb-[1vw] mr-[2vw]">
          <h3 className="font-semibold text-lg">{taskData.title}</h3>
          <Button
            variant="outline"
            onClick={() => router.push(`/task/details/${taskData.id}`)}
            className="px-[0.625vw] py-[0.3125vw] text-[0.8vw] hover:bg-blue-600 hover:text-white border-blue-600 bg-white text-blue-600"
          >
            See Details
          </Button>
        </div>
        <span className="block h-[1px] bg-gray-300 mb-4" />

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-2">
            <p className="text-sm text-gray-600 h-[10.5vw] w-full overflow-y-auto">
              {taskData.description}
            </p>
          </div>

          <div className="col-span-1 space-y-auto flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[0.9vw]">
              <Calendar className="w-[1.2vw] h-[1.2vw] text-gray-500" />
              <span>
                <strong>Duration:</strong>{" "}
                {format(new Date(taskData.startDate), "MMM d")} -{" "}
                {format(new Date(taskData.endDate), "MMM d")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[0.9vw]">
              <Activity className="w-[1.2vw] h-[1.2vw] text-gray-500" />
              <span>
                <strong>Workload:</strong>{" "}
                <span className="font-medium">{taskData.workload}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[0.9vw]">
              <AlertTriangle className="w-[1.2vw] h-[1.2vw] text-gray-500" />
              <span>
                <strong>Urgency:</strong>{" "}
                <span
                  className={`px-[0.5vw] py-[0.1vw] rounded-full text-[0.8vw] ${
                    taskData.urgency === "High"
                      ? "bg-red-100 text-red-800"
                      : taskData.urgency === "Medium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {taskData.urgency}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[0.9vw]">
              <Clock className="w-[1.2vw] h-[1.2vw] text-gray-500" />
              <span>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-[0.5vw] py-[0.1vw] rounded-full text-[0.8vw] ${
                    taskData.status === "Ongoing"
                      ? "bg-amber-100 text-amber-800"
                      : taskData.status === "Done"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {taskData.status}
                </span>
              </span>
            </div>
          </div>

          <div className="col-span-1 flex flex-col justify-between">
            <h3 className="font-semibold text-gray-600 mb-2 text-[0.9vw]">
              Assignees
            </h3>
            <div className="flex flex-wrap gap-2 mb-auto">
              {taskData?.assigns ? (
                renderAssigneeImages(taskData.assigns)
              ) : (
                <div className="text-gray-500 text-[0.8vw]">
                  No assignees found
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 justify-end">
              {/* Only show buttons if the task is not approved and showStatusButtons is true */}
              {showStatusButtons && taskData.status !== "Approved" && (
                <>
                  <Button
                    variant={
                      taskData.status === "Ongoing" ? "default" : "outline"
                    }
                    onClick={() => handleStatusChange("Ongoing")}
                    disabled={
                      taskData.status === "Approved" ||
                      taskData.status === "Ongoing"
                    }
                    className={`px-[0.625vw] py-[0.3125vw] text-[0.8vw] ${
                      taskData.status === "Ongoing"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white"
                    }`}
                  >
                    Ongoing
                  </Button>
                  <Button
                    variant={taskData.status === "Done" ? "default" : "outline"}
                    onClick={() => handleStatusChange("Done")}
                    disabled={
                      taskData.status === "Approved" ||
                      taskData.status === "Done"
                    }
                    className={`px-[0.625vw] py-[0.3125vw] text-[0.8vw] ${
                      taskData.status === "Done"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    Done
                  </Button>
                </>
              )}
              {taskData.status === "Approved" && (
                <span className="px-[0.625vw] py-[0.3125vw] text-[0.8vw] bg-green-500 text-white rounded-md">
                  Approved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFeedback && (
        <div className="mt-4 text-center text-sm text-green-600">
          {showFeedback}
        </div>
      )}

      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-[1.042vw] z-[60]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg w-full max-w-[40vw] p-6 relative"
            >
              {statusUpdateResult ? (
                <div className="flex flex-col items-center justify-center h-full">
                  {statusUpdateResult.success ? (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <CheckCircle2 className="mx-auto mb-4 w-16 h-16 text-green-500" />
                      <p className="text-green-600 font-semibold">
                        {statusUpdateResult.message}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <AlertCircle className="mx-auto mb-4 w-16 h-16 text-red-500" />
                      <p className="text-red-600 font-semibold">
                        {statusUpdateResult.message}
                      </p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Confirm Status Change
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Are you sure you want to change the task status to{" "}
                    <span className="font-bold">{pendingStatus}</span>?
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowConfirmation(false)}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmedStatusChange}
                      disabled={isSubmitting}
                      className={cn(
                        "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskDetails;
