"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface NewEmployeeData {
  id: string;
  name: string;
  image: File | null;
  phone: string;
  team: string;
  skill: string;
  start_Date: string;
  email: string;
  role: string;
}

interface AddEmployeeModalProps {
  onSuccess?: () => void;
}

interface FeedbackState {
  show: boolean;
  success: boolean;
  message: string;
}

const TEAM_OPTIONS = ["Pelayanan Pelanggan", "Korporat 1", "Korporat 2"];
const SKILL_OPTIONS = [
  "Backend Engineer",
  "Frontend Engineer",
  "Full-stack Engineer",
  "UI/UX Designer",
  "QA Engineer",
  "Testing Engineer",
  "System Administrator",
  "Data Analyst",
  "Data Engineer",
];

export function AddEmployeeModal({ onSuccess }: AddEmployeeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    success: false,
    message: "",
  });

  const [formData, setFormData] = useState<NewEmployeeData>({
    id: "",
    name: "",
    image: null,
    phone: "",
    team: "",
    skill: "",
    start_Date: "",
    email: "",
    role: "Employee",
  });

  useEffect(() => {
    const authToken = Cookies.get("auth_token");
    if (authToken) {
      try {
        const decodedToken: { role: string; team: string } =
          jwtDecode(authToken);
        setUserRole(decodedToken.role);
        if (decodedToken.role === "PIC") {
          setFormData((prev) => ({ ...prev, team: decodedToken.team }));
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast({
          title: "Invalid file type",
          description: "Please upload only JPG, JPEG, or PNG files",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const validateFormData = () => {
    if (!formData.start_Date) return "Start date is required";
    if (!formData.image && !selectedFile) return "Image is required";
    if (formData.name.length > 30)
      return "Name must be less than 30 characters";
    if (formData.email.length > 100)
      return "Email must be less than 30 characters";
    if (formData.phone.length > 30)
      return "Phone must be less than 30 characters";
    if (formData.team.length > 30)
      return "Team must be less than 30 characters";
    if (formData.skill.length > 30)
      return "Skill must be less than 30 characters";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateFormData();
    if (error) {
      setFeedback({
        show: true,
        success: false,
        message: error,
      });

      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, show: false }));
      }, 3000);
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setShowError(false);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("id", formData.id);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("team", formData.team);
      formDataToSend.append("skill", formData.skill);
      formDataToSend.append("start_Date", formData.start_Date);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("role", formData.role);

      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      const response = await fetch(
        "https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/add",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const responseData = await response.json();

      if (!response.ok || responseData.error) {
        throw new Error(responseData.error || "Failed to add employee");
      }

      setFeedback({
        show: true,
        success: true,
        message: "Employee added successfully!",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setFeedback({
        show: true,
        success: false,
        message: error.message || "Failed to add employee. Please try again.",
      });
    } finally {
      setTimeout(() => {
        setShowConfirmation(false);
        setIsOpen(false);
        setIsLoading(false);
        setFormData({
          id: "",
          name: "",
          image: null,
          phone: "",
          team: "",
          skill: "",
          start_Date: "",
          email: "",
          role: "Employee",
        });
        setSelectedFile(null);
        setImagePreview("");
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="h-[2.75vw] bg-blue-500 hover:bg-blue-600 text-white text-[0.875vw]">
            <Plus className="mr-[0.5vw]" />
            Add Employee
          </Button>
        </DialogTrigger>
        <DialogContent className="p-[1vw] overflow-hidden rounded-[0.833vw] max-w-[50vw]">
          <form
            onSubmit={handleSubmit}
            className="p-[1.25vw] space-y-[1.25vw] relative"
          >

            <DialogHeader>
              <DialogTitle className="text-[1.33vw] font-bold pt-[1.25vw]">
                Add New Employee
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-[1.25vw]">
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-[2.5vw] text-[0.8vw]"
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <Input
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  required
                  className="h-[2.5vw] text-[0.8vw]"
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Team <span className="text-red-500">*</span>
                </label>
                {userRole === "PIC" ? (
                  <Input
                    value={formData.team}
                    disabled
                    className="h-[2.5vw] text-[0.8vw] bg-gray-100"
                  />
                ) : (
                  <Select
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, team: value }))
                    }
                    required
                  >
                    <SelectTrigger className="h-[2.5vw] text-[0.8vw]">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_OPTIONS.map((team) => (
                        <SelectItem
                          key={team}
                          value={team}
                          className="text-[0.8vw]"
                        >
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Skill <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, skill: value }))
                  }
                  required
                >
                  <SelectTrigger className="h-[2.5vw] text-[0.8vw]">
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_OPTIONS.map((skill) => (
                      <SelectItem
                        key={skill}
                        value={skill}
                        className="text-[0.8vw]"
                      >
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-[2.5vw] text-[0.8vw]"
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="h-[2.5vw] text-[0.8vw]"
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="start_Date"
                  value={formData.start_Date}
                  onChange={handleInputChange}
                  className="h-[2.5vw] text-[0.8vw]"
                  required
                />
              </div>
              <div className="space-y-[0.25vw]">
                <label className="text-[1vw] font-medium">
                  Profile Image <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="h-[2.5vw] text-[0.8vw] hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center h-[2.5vw] px-2 border rounded-md cursor-pointer hover:bg-gray-50 line-clamp-2 mb-2 break-all"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    <span className="text-[0.8vw]">
                      {selectedFile ? selectedFile.name : "Upload Image"}
                    </span>
                  </label>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-[5vw] w-auto object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-[0.833vw] pt-[0.833vw]">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-transparent text-[0.8vw]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#38BDF8] hover:bg-[#32a8dd] text-white px-8 text-[0.8vw]"
                disabled={isLoading}
              >
                Add Employee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                Confirm Employee Addition
              </AlertDialogTitle>
              <div className="space-y-[1vw]">
                <AlertDialogDescription className="text-[1vw]">
                  Please review the employee details below:
                </AlertDialogDescription>
                <motion.div
                  className="space-y-[0.8vw] text-[0.9vw] border rounded-[0.4vw] p-[1vw] bg-gray-50"
                  initial={{ y: "1vw", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div>
                    <strong>Name:</strong> {formData.name}
                  </div>
                  <div>
                    <strong>Employee ID:</strong> {formData.id}
                  </div>
                  <div>
                    <strong>Team:</strong> {formData.team}
                  </div>
                  <div>
                    <strong>Skill:</strong> {formData.skill}
                  </div>
                  <div>
                    <strong>Email:</strong> {formData.email}
                  </div>
                  <div>
                    <strong>Role:</strong> {formData.role}
                  </div>
                  <div>
                    <strong>Phone:</strong> {formData.phone}
                  </div>
                  <div>
                    <strong>Start Date:</strong>{" "}
                    {formData.start_Date
                      ? formatDate(formData.start_Date)
                      : "Not specified"}
                  </div>
                  {selectedFile && (
                    <div>
                      <strong>Selected Image:</strong> {selectedFile.name}
                    </div>
                  )}
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
                disabled={isLoading}
                className="bg-[#38BDF8] hover:bg-[#32a8dd] text-[0.8vw]"
              >
                {isLoading ? "Adding..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

            {/* Feedback Toast */}
            <AnimatePresence>
        {feedback.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-[2vw] right-[2vw] p-[1vw] rounded-lg shadow-lg flex items-center gap-[0.8vw] z-[100]
              ${feedback.success ? "bg-green-100" : "bg-red-100"}`}
          >
            {feedback.success ? (
              <CheckCircle2
                className={`w-[1.5vw] h-[1.5vw] ${
                  feedback.success ? "text-green-600" : "text-red-600"
                }`}
              />
            ) : (
              <AlertCircle
                className={`w-[1.5vw] h-[1.5vw] ${
                  feedback.success ? "text-green-600" : "text-red-600"
                }`}
              />
            )}
            <span
              className={`text-[1vw] ${
                feedback.success ? "text-green-800" : "text-red-800"
              }`}
            >
              {feedback.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}