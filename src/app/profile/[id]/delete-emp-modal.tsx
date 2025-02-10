"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface DeleteConfirmModalProps {
  employeeId: string
  employeeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FeedbackState {
  show: boolean
  success: boolean
  message: string
}

export function DeleteConfirmModal({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: DeleteConfirmModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    success: false,
    message: ""
  })

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

      setFeedback({
        show: true,
        success: true,
        message: "Employee has been deleted successfully"
      })

      setTimeout(() => {
        router.push('/activity')
      }, 1000)
    } catch (error) {
      setFeedback({
        show: true,
        success: false,
        message: "Failed to delete employee. Please try again."
      })
    } finally {
      setIsLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-[40vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[1.5vw] font-bold">
              Delete Employee
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[1vw]">
              Are you sure you want to delete {employeeName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-[2vw]">
            <AlertDialogCancel 
              className="text-[0.9vw] px-[2vw] py-[1vw]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-[0.9vw] px-[2vw] py-[1vw] bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback.show && (
          <motion.div
            key="feedback-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-[2vw] right-[2vw] p-[1vw] rounded-lg shadow-lg flex items-center gap-[0.8vw]
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
  )
}