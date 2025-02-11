// Types and Interfaces
interface Task {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Normal';
    workload: number;
    start_Date: string;
    end_Date: string;
  }
  
  interface FormErrors {
    title?: string;
    description?: string;
    priority?: string;
    workload?: string;
    start_Date?: string;
    end_Date?: string;
    submit?: string;
  }
  
  interface EditTaskDialogProps {
    showEditDialog: boolean;
    setShowEditDialog: (show: boolean) => void;
    editForm: Task;
    setEditForm: React.Dispatch<React.SetStateAction<Task>>;
    handleEditSubmit: () => Promise<void>;
    isEditing: boolean;
  }
  
  import React, { useState } from 'react';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Textarea } from '@/components/ui/textarea';
  import { Alert, AlertDescription } from '@/components/ui/alert';
  import { motion } from 'framer-motion';
  
  // Error message component
  const ErrorMessage: React.FC<{ message?: string }> = ({ message }) => (
    message ? (
      <span className="text-[0.7vw] text-red-500 mt-1">{message}</span>
    ) : null
  );
  
  const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
    showEditDialog,
    setShowEditDialog,
    editForm,
    setEditForm,
    handleEditSubmit,
    isEditing
  }) => {
    // State for form errors
    const [errors, setErrors] = useState<FormErrors>({});
  
    // Validate form fields
    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;
  
      // Title validation
      if (!editForm.title.trim()) {
        newErrors.title = 'Title is required';
        isValid = false;
      }
  
      // Priority validation
      if (!editForm.priority) {
        newErrors.priority = 'Priority is required';
        isValid = false;
      }
  
      // Workload validation
      if (editForm.workload === null) {
        newErrors.workload = 'Workload is required';
        isValid = false;
      } else if (typeof editForm.workload === 'number' && (editForm.workload <= 0 || editForm.workload > 10)) {
        newErrors.workload = 'Workload must be between 0 and 10';
        isValid = false;
      }
  
      // Date validations
      if (!editForm.start_Date) {
        newErrors.start_Date = 'Start date is required';
        isValid = false;
      }
  
      if (!editForm.end_Date) {
        newErrors.end_Date = 'End date is required';
        isValid = false;
      } else if (editForm.start_Date && editForm.end_Date && new Date(editForm.end_Date) < new Date(editForm.start_Date)) {
        newErrors.end_Date = 'End date cannot be earlier than start date';
        isValid = false;
      }
  
      setErrors(newErrors);
      return isValid;
    };
  
    // Form submission handler
    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (validateForm()) {
          await handleEditSubmit();
        }
      } catch (error) {
        // Handle any API or submission errors
        setErrors(prev => ({
          ...prev,
          submit: error instanceof Error ? error.message : 'An error occurred while saving changes'
        }));
      }
    };
  
    // Input change handler with type safety
    const handleInputChange = (
      field: keyof Task,
      value: string | number
    ): void => {
      setEditForm(prev => ({ ...prev, [field]: value }));
      // Clear error for the field being changed
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };
  
    // Workload change handler with proper type checking
    const handleWorkloadChange = (value: string): void => {
      if (value === "") {
        handleInputChange('workload', '');
      } else {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 10) {
          handleInputChange('workload', numericValue);
        }
      }
    };
  
    return (
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[50vw] max-h-[45vw] gap-[0.2vw]">
          <DialogHeader className="pb-3 border-b border-gray-200">
            <DialogTitle className="text-[1vw] font-medium">
              Edit Task
            </DialogTitle>
            <DialogDescription className="text-[0.8vw] text-gray-500">
              Make changes to the task details below.
            </DialogDescription>
          </DialogHeader>
  
          <form onSubmit={onSubmit} className="grid gap-[0.5vw] py-[0.1vw]">
            <div className="grid gap-1.5">
              <Label htmlFor="title" className="text-[0.8vw] font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full text-[0.8vw] ${errors.title ? 'border-red-500' : ''}`}
              />
              <ErrorMessage message={errors.title} />
            </div>
  
            <div className="grid gap-1.5">
              <Label htmlFor="description" className="text-[0.8vw] font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`min-h-[15vh] text-[0.8vw] ${errors.description ? 'border-red-500' : ''}`}
              />
              <ErrorMessage message={errors.description} />
            </div>
  
            <div className="grid gap-1.5">
              <Label htmlFor="priority" className="text-[0.8vw] font-medium">
                Priority
              </Label>
              <select
                id="priority"
                value={editForm.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as Task['priority'])}
                className={`flex h-9 w-full rounded-md border bg-white px-2.5 py-1.5 text-[0.8vw] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.priority ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Normal">Normal</option>
              </select>
              <ErrorMessage message={errors.priority} />
            </div>
  
            <div className="grid gap-1.5">
              <Label htmlFor="workload" className="text-[0.8vw] font-medium">
                Workload (0 - 10)
              </Label>
              <Input
                id="workload"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={editForm.workload}
                onChange={(e) => handleWorkloadChange(e.target.value)}
                className={`text-[0.8vw] ${errors.workload ? 'border-red-500' : ''}`}
              />
              <ErrorMessage message={errors.workload} />
            </div>
  
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="start_Date" className="text-[0.8vw] font-medium">
                  Start Date
                </Label>
                <Input
                  id="start_Date"
                  type="date"
                  value={editForm.start_Date}
                  onChange={(e) => handleInputChange('start_Date', e.target.value)}
                  className={`text-[0.8vw] ${errors.start_Date ? 'border-red-500' : ''}`}
                />
                <ErrorMessage message={errors.start_Date} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="end_Date" className="text-[0.8vw] font-medium">
                  End Date
                </Label>
                <Input
                  id="end_Date"
                  type="date"
                  value={editForm.end_Date}
                  onChange={(e) => handleInputChange('end_Date', e.target.value)}
                  className={`text-[0.8vw] ${errors.end_Date ? 'border-red-500' : ''}`}
                />
                <ErrorMessage message={errors.end_Date} />
              </div>
            </div>
  
            {(errors.submit || Object.values(errors).some(error => error)) && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription className="text-[0.8vw]">
                  {errors.submit || 'Please complete all the required field above.'}
                </AlertDescription>
              </Alert>
            )}
  
            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => setShowEditDialog(false)}
                className="px-3 py-1.5 text-[0.8vw] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isEditing}
                className="px-3 py-1.5 text-[0.8vw] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default EditTaskDialog;