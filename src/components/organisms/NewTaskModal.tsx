"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    name: string;
    workload: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => void;
  employeeId?: string;
}

export const NewTaskModal = ({ open, onClose, onSubmit, employeeId }: NewTaskModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    workload: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter Task Name"
                  className="h-12 px-4 rounded-lg border border-gray-200"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm">
                  Task Workload <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.workload}
                  onChange={(e) => setFormData({ ...formData, workload: e.target.value })}
                  placeholder="Enter Task Workload"
                  className="h-12 px-4 rounded-lg border border-gray-200"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm">
                  Task Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-12 px-4 rounded-lg border border-gray-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm">
                  Task End Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-12 px-4 rounded-lg border border-gray-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="space-y-2">
            <label className="block text-sm">
              Task Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter Task Description"
              className={cn(
                "w-full min-h-[120px] px-4 py-3 rounded-lg border border-gray-200",
                "resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
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
            >
              Assign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskModal;
