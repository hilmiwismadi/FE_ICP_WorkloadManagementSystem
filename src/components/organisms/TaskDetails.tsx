import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Calendar, Activity, AlertTriangle, Clock, UserPlus } from "lucide-react";

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  email?: string;
  team?: string;
  skill?: string;
  phone?: string;
  current_Workload: number;
  users?: Array<{
    email: string;
  }>;
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

interface TaskDetailsProps {
  selectedTask: Task | null;
  onStatusUpdate: (taskId: string, newStatus: 'Ongoing' | 'Done' | 'Approved') => void;
}

const calculateWorkloadPercentage = (workload: number): number => {
  const normalize = workload / 15;
  return normalize * 100;
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

export const TaskDetails = ({ selectedTask, onStatusUpdate }: TaskDetailsProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'Ongoing' | 'Done' | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [hoverCardPosition, setHoverCardPosition] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read");
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          setEmployees(result.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const getEmployeeDetails = (employeeId: string) => {
    return employees.find((emp) => emp.employee_Id === employeeId);
  };

  const handleStatusChange = (newStatus: 'Ongoing' | 'Done') => {
    // Don't allow status change if current status is 'Approved'
    if (selectedTask?.status === 'Approved') {
      toast({
        title: 'Cannot modify approved tasks',
        description: 'This task has been approved and cannot be modified.',
        variant: 'destructive',
      });
      return;
    }

    setPendingStatus(newStatus);
    setShowConfirmation(true);
  };

  const handleConfirmedStatusChange = async () => {
    if (!selectedTask || !pendingStatus) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/task/edit/${selectedTask.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: pendingStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      toast({
        title: 'Success!',
        description: `Task status updated to ${pendingStatus}`,
        duration: 3000,
      });

      // Notify parent component of the status update
      if (onStatusUpdate) {
        onStatusUpdate(selectedTask.id, pendingStatus as 'Ongoing' | 'Done' | 'Approved');
      }
      
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setPendingStatus(null);
    }
  };

  const renderAssigneeImages = (assigns: any[]) => {
    return assigns.map((assign, index) => {
      const employeeDetails = getEmployeeDetails(assign.employee_Id);
      const image = employeeDetails?.image || "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ";

      return (
        <div 
          key={assign.employee_Id} 
          className="relative group"
          onMouseEnter={(event) => {
            const card = event.currentTarget.querySelector('.hover-card');
            if (card) {
              const rect = card.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              const spaceAbove = rect.top;

              const employeeId = employeeDetails?.employee_Id as string;
              if (spaceBelow < rect.height && spaceAbove > rect.height) {
                setHoverCardPosition(prev => ({ ...prev, [employeeId]: 'above' }));
              } else {
                setHoverCardPosition(prev => ({ ...prev, [employeeId]: 'below' }));
              }
            }
          }}
        >
          <div className="w-[2.5vw] h-[2.5vw] rounded-full bg-gray-200 border-[0.08vw] border-white flex items-center justify-center overflow-hidden">
            <img
              src={image}
              alt={employeeDetails?.name || `Employee ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Hover Card */}
          {employeeDetails && (
            <motion.div
              className={`absolute left-0 transform -translate-x-full 
                ${hoverCardPosition[employeeDetails.employee_Id] === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'} 
                w-[12vw] bg-white rounded-lg shadow-lg p-[0.625vw] hidden group-hover:block z-50 border border-gray-200 hover-card`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-start gap-[0.625vw]">
                <img
                  src={image}
                  alt={employeeDetails.name}
                  className="w-[2.5vw] h-[2.5vw] rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-[0.9vw]">{employeeDetails.name}</h4>
                  <p className="text-[0.6vw] text-gray-500">{employeeDetails.users?.[0]?.email}</p>
                </div>
              </div>
              <div className="mt-[0.5vw] space-y-[0.25vw] text-[0.6vw]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Team:</span>
                  <span className="text-gray-900">{employeeDetails.team}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="text-gray-900">{employeeDetails.skill}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Workload:</span>
                  <span className={`${getWorkloadColor(employeeDetails.current_Workload)}`}>
                    {calculateWorkloadPercentage(employeeDetails.current_Workload).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="text-gray-900">{employeeDetails.phone}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      );
    });
  };

  if (!selectedTask) {
    return null;
  }

  return (
    <>
      <div className="p-[1vw] border rounded-lg bg-white w-full min-h-[28vh] scale-[0.98] ">
        <div className="flex justify-between items-center ">
          <h3 className="font-semibold text-[1.2vw]">{selectedTask.title}</h3>
          <Button
            variant="outline"
            onClick={() => router.push(`/task/details/${selectedTask.id}`)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            See Details
          </Button>
        </div>
        <div className="mt-2 text-gray-600 text-[1vw] flex">
          <div className="w-1/3 space-y-[0.2vw]">
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Duration: {format(new Date(selectedTask.startDate), "MMM d")} -{" "}
              {format(new Date(selectedTask.endDate), "MMM d")}
            </p>
            <p className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              Workload: <span className="font-medium">{selectedTask.workload}</span>
            </p>
            <p className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              Urgency:{" "}
              <span
                className={`px-2 py-0.5 rounded-full text-sm ${
                  selectedTask.urgency === "High"
                    ? "bg-red-100 text-red-800"
                    : selectedTask.urgency === "Medium"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {selectedTask.urgency}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Status:{" "}
              <span
                className={`px-2 py-0.5 rounded-full text-sm capitalize ${
                  selectedTask.status === "Ongoing"
                    ? "bg-yellow-100 text-yellow-800"
                    : selectedTask.status === "Done"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {selectedTask.status}
              </span>
            </p>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-600 mb-[1vw] text-sm">Assignees</h3>
              <div className="flex gap-[0.8vw]">
                {selectedTask?.assigns ? (
                  renderAssigneeImages(selectedTask.assigns)
                ) : (
                  <div className="text-gray-500 text-sm">No assignees found</div>
                )}
              </div>
            </div>
          </div>
          <div className="w-2/3 space-y-[0.2vw]">
            <div className="flex items-center space-x-2">
              <span>Progress:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedTask.status === 'Ongoing' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('Ongoing')}
                  disabled={selectedTask.status === 'Approved' || selectedTask.status === 'Ongoing'}
                  className={`px-4 py-2 ${
                    selectedTask.status === 'Ongoing' 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'text-yellow-600 border-yellow-600 hover:bg-yellow-50'
                  }`}
                >
                  Ongoing
                </Button>
                <Button
                  variant={selectedTask.status === 'Done' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('Done')}
                  disabled={selectedTask.status === 'Approved' || selectedTask.status === 'Done'}
                  className={`px-4 py-2 ${
                    selectedTask.status === 'Done' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'text-green-600 border-green-600 hover:bg-green-50'
                  }`}
                >
                  Done
                </Button>
                {selectedTask.status === 'Approved' && (
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-md">
                    Approved
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2">{selectedTask.description}</p>
          </div>
        </div>
      </div>

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
                Confirm Status Change
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[1vw]">
                Are you sure you want to change the task status to {pendingStatus}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-[1vw]">
              <AlertDialogCancel
                disabled={isSubmitting}
                className="text-[0.8vw]"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmedStatusChange}
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
                    Updating...
                  </div>
                ) : (
                  "Confirm Change"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskDetails;