import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from 'next/link';

const NoTasksNotification: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">No Tasks Found</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center px-[3vw] pt-[1vw] pb-[1.5vw]">
          <div className="mb-4">
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-center text-gray-600">
            You currently don&apos;t have any tasks assigned to any employee. You can assign a task by clicking the button below.
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Link href="/task" className="w-full h-full flex items-center justify-center">
              Assign Task
            </Link>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoTasksNotification;