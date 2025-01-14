"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/hooks/use-toast"

interface DeleteConfirmModalProps {
  employeeId: string
  employeeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteConfirmModal({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: DeleteConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/delete/${employeeId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) throw new Error('Failed to delete employee')

      toast({
        title: "Success",
        description: "Employee has been deleted successfully",
        className: "bg-green-500 text-white",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[40vw]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-1.5vw font-bold">
            Delete Employee
          </AlertDialogTitle>
          <AlertDialogDescription className="text-1vw">
            Are you sure you want to delete {employeeName}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2vw">
          <AlertDialogCancel 
            className="text-0.9vw px-2vw py-1vw"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="text-0.9vw px-2vw py-1vw bg-red-500 hover:bg-red-600 text-white"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}