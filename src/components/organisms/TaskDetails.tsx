import { useState } from "react";
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

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  workload: string;
  urgency: string;
  status: string;
}

interface TaskDetailsProps {
  selectedTask: Task | null;
  onStatusUpdate: (taskId: string, newStatus: 'Ongoing' | 'Done' | 'Approved') => void;
}

export const TaskDetails = ({ selectedTask, onStatusUpdate }: TaskDetailsProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'Ongoing' | 'Done' | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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

  if (!selectedTask) {
    return null;
  }

  return (
    <>
      <div className="p-[1vw] border rounded-lg bg-white w-full min-h-[30vh] ">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-[1.2vw]">{selectedTask.title}</h3>
          <Button
            variant="outline"
            onClick={() => router.push(`/task/details/${selectedTask.id}`)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            See Details
          </Button>
        </div>
        <div className="mt-2 text-gray-600 space-y-[0.2vw] text-[1vw]">
          <p>
            Duration: {format(new Date(selectedTask.startDate), "MMM d")} -{" "}
            {format(new Date(selectedTask.endDate), "MMM d")}
          </p>
          <p>Workload: {selectedTask.workload}</p>
          <p>Urgency: {selectedTask.urgency}</p>
          <p>
            Status: <span className="capitalize">{selectedTask.status}</span>
          </p>
          <div className="flex items-center space-x-2">
            <span>Progress:</span>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedTask.status === 'Ongoing' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('Ongoing')}
                disabled={selectedTask.status === 'Approved'}
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
                disabled={selectedTask.status === 'Approved'}
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