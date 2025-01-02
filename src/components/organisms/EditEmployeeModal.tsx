import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const MultiSelect = ({ values, onChange, options, placeholder }) => {
  return (
    <Select
      onValueChange={() => {}}
      value={values.length ? ' ' : undefined}
    >
      <SelectTrigger className="w-full bg-white border border-gray-200 rounded-lg min-h-[3vw]">
        <SelectValue placeholder={placeholder}>
          {values.length > 0 ? values.join(', ') : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[var(--radix-select-trigger-width)] p-0">
        <div className="max-h-[16vw] overflow-auto p-2">
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-md cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                const newValues = values.includes(option)
                  ? values.filter(v => v !== option)
                  : [...values, option];
                onChange(newValues);
              }}
            >
              <Checkbox
                checked={values.includes(option)}
                className="rounded-sm"
              />
              <span className="text-sm">{option}</span>
            </div>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
};

const EditEmployeeModal = ({ employee, onUpdate }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    teams: employee?.teams || [],
    roles: employee?.roles || [],
    programmingLanguages: employee?.programmingLanguages || []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    setEditModalOpen(false);
    setConfirmModalOpen(true);
  };

  const handleConfirmCancel = () => {
    setConfirmModalOpen(false);
    setEditModalOpen(true);
  };

  const confirmUpdate = () => {
    onUpdate(formData);
    setConfirmModalOpen(false);
  };

  return (
    <>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => setEditModalOpen(true)}
        className="p-4 gap-2 rounded-full bg-[#29A6DE] text-white font-semibold
                   transition-all duration-300 ease-out
                   hover:bg-[#1a8ac0] hover:shadow-lg hover:shadow-[#29A6DE]/20
                   hover:scale-105 hover:-translate-y-0.5
                   active:scale-95 active:shadow-md
                   focus:ring-2 focus:ring-[#29A6DE]/50 focus:ring-offset-2"
      >
        <Edit className="h-4 w-4" /> Edit Employee
      </Button>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[32vw] lg:max-w-[52vw] min-h-[32vw] bg-white p-2 gap-4">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-semibold">Edit Employee Profile</DialogTitle>
          </DialogHeader>

          <div className="p-6 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium flex gap-1">
                Employee Name
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Employee Name"
                className="bg-white border border-gray-200 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex gap-1">
                Employee Team
                <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                values={formData.teams}
                onChange={(teams) => setFormData(prev => ({ ...prev, teams }))}
                options={["Frontend", "Backend", "DevOps", "QA", "Design", "Mobile", "Infrastructure"]}
                placeholder="Select Team"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex gap-1">
                Employee Email
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Employee Email"
                type="email"
                className="bg-white border border-gray-200 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex gap-1">
                Employee Programming Language
                <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                values={formData.programmingLanguages}
                onChange={(langs) => setFormData(prev => ({ ...prev, programmingLanguages: langs }))}
                options={["JavaScript", "TypeScript", "Python", "Java", "C#", "Go", "Ruby", "PHP", "Swift", "Kotlin"]}
                placeholder="Select Programming Language"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex gap-1">
                Employee Phone Number
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter Employee Phone Number"
                className="bg-white border border-gray-200 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex gap-1">
                Employee Role
                <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                values={formData.roles}
                onChange={(roles) => setFormData(prev => ({ ...prev, roles }))}
                options={["Junior Developer", "Senior Developer", "Team Lead", "Tech Lead", "Solution Architect", "Project Manager", "Product Manager", "DevOps Engineer"]}
                placeholder="Select Role"
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-2">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 border-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#29A6DE] hover:bg-[#1a8ac0] px-8"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this employee's information?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleConfirmCancel}>No, cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpdate} className="bg-[#29A6DE] hover:bg-[#1a8ac0]">
              Yes, update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditEmployeeModal;