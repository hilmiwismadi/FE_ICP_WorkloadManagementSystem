import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { parse } from "cookie";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PencilIcon, Lock, CheckCircle2, Camera, Plus } from "lucide-react";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  phone: string;
  skill: string;
}

interface PasswordChangeForm {
  previousPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface TechStack {
  name: string;
  image: string;
}

interface UserTechStack {
  name: string;
  image: string;
}

interface UserProfileProps {
  employee: Employee | null;
  onSave: (formData: FormData) => Promise<boolean>;
  onImageChange: (file: File | null) => void;
  selectedImage: File | null;
  techStack: string[];
}

export default function EditUserProfile({
  employee,
  onSave,
  onImageChange,
  selectedImage,
  techStack,
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userTechStack, setUserTechStack] = useState<UserTechStack[]>([]);
  const [availableTechStack, setAvailableTechStack] = useState<TechStack[]>([]);
  const [isTechStackModalOpen, setIsTechStackModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [isConfirmTechOpen, setIsConfirmTechOpen] = useState(false);
  const [isLoadingTech, setIsLoadingTech] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState<
    "profile" | "password"
  >("profile");
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    phone: employee?.phone || "",
    skill: employee?.skill || "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    previousPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const { id } = useParams();
  const [showImageUploadHelper, setShowImageUploadHelper] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handleSaveClick = () => {
    setConfirmationType("profile");
    setShowConfirmation(true);
  };

  const handlePasswordChangeClick = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setConfirmationType("password");
    setShowConfirmation(true);
  };

  const handleSave = async () => {
    console.log("Saving form data:", formData);
    const editedData = new FormData();

    // Append all fields regardless of whether they have changed
    editedData.append("name", formData.name);
    editedData.append("phone", formData.phone);
    editedData.append("skill", formData.skill);
    if (selectedImage) {
      editedData.append("image", selectedImage);
    }

    // Call the onSave function with the edited data
    const success = await onSave(editedData);
    if (success) {
      setShowConfirmation(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsEditing(false);
        window.location.reload();
      }, 1500);
    } else {
      console.error("Failed to update profile");
      alert("An error occurred while updating the profile.");
    }
  };

  useEffect(() => {
    const fetchUserTechStack = async () => {
      try {
        const cookies = document.cookie;
        const parsedCookies = parse(cookies);
        const token = parsedCookies.auth_token;

        if (!token) {
          console.error("No auth token found in cookies");
          return;
        }

        const decodedToken: any = jwtDecode(token);
        const employee_Id = decodedToken.employee_Id;

        console.log("Fetching tech stack for user:", employee_Id);

        const response = await fetch(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${employee_Id}`
        );

        console.log("User tech stack response status:", response.status);
        const data = await response.json();
        console.log("User tech stack response data:", data);

        if (response.ok && data.data) {
          // Map skills array and extract the necessary data
          const mappedSkills = data.data.skills.map((skill: any) => ({
            skill_Id: skill.skill_Id,
            name: skill.techStack.name,
            image: skill.techStack.image,
          }));

          setUserTechStack(mappedSkills);
        } else {
          console.error("Error fetching user tech stack:", data);
        }
      } catch (error) {
        console.error("Exception in fetchUserTechStack:", error);
      }
    };

    fetchUserTechStack();
  }, []);

  useEffect(() => {
    console.log("Current user tech stack:", userTechStack);
  }, [userTechStack]);

  useEffect(() => {
    console.log("Available tech stack:", availableTechStack);
  }, [availableTechStack]);

  useEffect(() => {
    console.log("Selected tech:", selectedTech);
  }, [selectedTech]);

  const fetchAvailableTechStack = async () => {
    try {
      const cookies = document.cookie;
      const parsedCookies = parse(cookies);
      const token = parsedCookies.auth_token;

      if (!token) {
        console.error("No auth token found in cookies");
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const employee_Id = decodedToken.employee_Id;

      console.log("Fetching available tech stack...");

      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/tech/read/${employee_Id}`
      );

      console.log("Available tech stack response status:", response.status);
      const data = await response.json();
      console.log("Available tech stack response data:", data);

      if (response.ok) {
        setAvailableTechStack(data.data || []);
      } else {
        console.error("Error fetching available tech stack:", data);
      }
    } catch (error) {
      console.error("Exception in fetchAvailableTechStack:", error);
    }
  };

  const handleAddTechStack = async () => {
    setIsLoadingTech(true);
    try {
      const cookies = document.cookie;
      const parsedCookies = parse(cookies);
      const token = parsedCookies.auth_token;
      if (!token) {
        console.error("No auth token found in cookies");
        return;
      }
      const decodedToken: any = jwtDecode(token);
      const employee_Id = decodedToken.employee_Id;

      console.log("Adding tech stack for user:", employee_Id);
      console.log("Tech stack to add:", selectedTech);

      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/tech/add/${employee_Id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            techStack_Ids: selectedTech,
          }),
        }
      );

      console.log("Add tech stack response status:", response.status);
      const data = await response.json();
      console.log("Add tech stack response data:", data);

      if (response.ok) {
        setIsConfirmTechOpen(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsTechStackModalOpen(false);
          setSelectedTech([]);
          // Refresh user's tech stack
          const fetchUserTechStack = async () => {
            const response = await fetch(
              `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${employee_Id}`
            );

            console.log("User tech stack response status:", response.status);
            const data = await response.json();
            console.log("User tech stack response data:", data);

            if (response.ok && data.data) {
              // Map skills array and extract the necessary data
              const mappedSkills = data.data.skills.map((skill: any) => ({
                skill_Id: skill.skill_Id,
                name: skill.techStack.name,
                image: skill.techStack.image,
              }));

              setUserTechStack(mappedSkills);
            }
          };
          fetchUserTechStack();
        }, 1500);
      } else if (response.status === 409) {
        console.error(
          "Conflict detected. Current user tech stack:",
          userTechStack
        );
        console.error("Attempted to add tech stack:", selectedTech);
        alert(
          "Some selected skills are already in your profile. Please select different skills."
        );
      } else {
        console.error("Error adding tech stack:", data);
        alert("An error occurred while adding skills. Please try again.");
      }
    } catch (error) {
      console.error("Exception in handleAddTechStack:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoadingTech(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsSubmitting(true);
    try {
      const cookies = document.cookie;
      const parsedCookies = parse(cookies);
      const token = parsedCookies.auth_token;

      if (!token) {
        throw new Error("User is not authenticated");
      }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.user_Id;

      if (!userId) {
        throw new Error("Invalid token: user ID not found");
      }

      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/user/updatePass/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: passwordForm.previousPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      if (response.ok) {
        setShowConfirmation(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsPasswordModalOpen(false);
          setPasswordForm({
            previousPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }, 1500);
      } else {
        const data = await response.json();
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to change password"
        );
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Image upload UI component
  const ImageUploadOverlay = () => (
    <div
      className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center 
                cursor-pointer group-hover:opacity-100 transition-opacity"
    >
      <Camera className="w-[1.5vw] h-[1.5vw] text-white mb-2" />
      <span className="text-white text-[0.8vw] text-center px-2">
        Click to change photo
      </span>
    </div>
  );

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {/* Profile Header */}
      <div className="bg-[#15234A] rounded-t-[0.833vw] p-[1.5vw] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[1vw]">
            <div
              className="relative w-[6vw] h-[6vw] group"
              onMouseEnter={() => isEditing && setShowImageUploadHelper(true)}
              onMouseLeave={() => setShowImageUploadHelper(false)}
            >
              <Image
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : employee?.image || "/img/sidebar/UserProfile.png"
                }
                alt="Profile"
                fill
                className="rounded-full object-cover"
                priority
              />
              {isEditing && showImageUploadHelper && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onImageChange(file || null);
                    }}
                  />
                  <ImageUploadOverlay />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-[1.25vw] font-medium">{employee.name}</h2>
              <p className="text-[0.875vw] text-gray-300">
                ID-{employee.employee_Id}
              </p>
            </div>
          </div>
          <div>
            <div className="flex gap-[0.5vw]">
              <Button
                variant="default"
                className="bg-[#26A4FF] hover:bg-[#1a8cd8] text-white flex items-center gap-[0.5vw] text-[0.875vw]"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Lock size={16} />
                Change Password
              </Button>
              <Button
                variant="default"
                className={`${
                  isEditing
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-[#26A4FF] hover:bg-[#1a8cd8]"
                } text-white flex items-center gap-[0.5vw] text-[0.875vw]`}
                onClick={() => setIsEditing(!isEditing)}
              >
                <PencilIcon size={16} />
                {isEditing ? "Editing" : "Edit Profile"}
              </Button>
            </div>
            <div></div>
            {isEditing && (
              <div className="mt-[1.5vw] flex justify-end gap-[1vw]">
                <Button
                  variant="default"
                  className="bg-red-500 hover:bg-red-600 text-white text-[0.875vw]"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: employee.name,
                      phone: employee.phone,
                      skill: employee.skill,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-green-500 hover:bg-green-600 text-white text-[0.875vw]"
                  onClick={handleSaveClick}
                >
                  Save
                </Button>
              </div>
            )}
          </div>

          {/* Save & Cancel Buttons */}
        </div>
      </div>

      {/* Profile Details */}
      <Card className="mt-[1.5vw] p-[1.5vw] space-y-[1.5vw] relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="flex flex-col items-center space-y-[1vw]"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle2 className="w-[4vw] h-[4vw] text-green-500" />
                </motion.div>
                <p className="text-[1.2vw] font-semibold text-green-600">
                  {confirmationType === "profile"
                    ? "Profile updated successfully!"
                    : "Password changed successfully!"}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-[1vw]">
          {Object.entries(formData).map(([field, value]) => (
            <div key={field}>
              <h3 className="text-[0.875vw] font-medium mb-[0.5vw]">
                Employee {field.charAt(0).toUpperCase() + field.slice(1)}
              </h3>
              {isEditing ? (
                <input
                  type="text"
                  name={field}
                  value={value}
                  onChange={handleInputChange}
                  className="w-full bg-gray-100 p-[0.75vw] rounded-[0.417vw] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#26A4FF] text-[0.875vw]"
                />
              ) : (
                <div className="bg-gray-100 p-[0.75vw] rounded-[0.417vw] text-gray-600 text-[0.875vw]">
                  {value}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50">
          <Card className="w-[90vw] max-w-[30vw] p-[1.5vw] relative">
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="flex flex-col items-center space-y-[1vw]"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 className="w-[4vw] h-[4vw] text-green-500" />
                    </motion.div>
                    <p className="text-[1.2vw] font-semibold text-green-600">
                      Password changed successfully!
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <h2 className="text-[1.25vw] font-semibold mb-[1vw]">
              Change Password
            </h2>
            {passwordError && (
              <p className="text-red-500 mb-[1vw] text-[0.875vw]">
                {passwordError}
              </p>
            )}

            <div className="space-y-[1vw]">
              <div>
                <label className="text-[0.875vw] font-medium">
                  Previous Password
                </label>
                <input
                  type="password"
                  name="previousPassword"
                  value={passwordForm.previousPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full mt-[0.25vw] bg-gray-100 p-[0.75vw] rounded-[0.417vw] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#26A4FF] text-[0.875vw]"
                />
              </div>
              <div>
                <label className="text-[0.875vw] font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full mt-[0.25vw] bg-gray-100 p-[0.75vw] rounded-[0.417vw] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#26A4FF] text-[0.875vw]"
                />
              </div>
              <div>
                <label className="text-[0.875vw] font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full mt-[0.25vw] bg-gray-100 p-[0.75vw] rounded-[0.417vw] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#26A4FF] text-[0.875vw]"
                />
              </div>
            </div>
            <div className="mt-[1.5vw] flex justify-end gap-[1vw]">
              <Button
                variant="default"
                className="bg-gray-500 hover:bg-gray-600 text-white text-[0.875vw]"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordError("");
                  setPasswordForm({
                    previousPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-[#26A4FF] hover:bg-[#1a8cd8] text-white text-[0.875vw]"
                onClick={handlePasswordChangeClick}
              >
                Change Password
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="mt-[1.5vw] p-[1.5vw] space-y-[1.5vw]">
        <div className="flex justify-between items-center">
          <h2 className="text-[1.25vw] font-semibold">Technical Skills</h2>
          <Button
            variant="default"
            className="bg-[#26A4FF] hover:bg-[#1a8cd8] text-white flex items-center gap-[0.5vw] text-[0.875vw]"
            onClick={() => {
              fetchAvailableTechStack();
              setIsTechStackModalOpen(true);
            }}
          >
            <Plus size={16} />
            Add Skill
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-[1vw]">
          {userTechStack.map((tech, index) => (
            <div
              key={index} // Use skill_Id if available
              className="flex items-center gap-[0.5vw] p-[0.75vw] bg-gray-100 rounded-[0.417vw]"
            >
              <Image
                src={tech.image}
                alt={tech.name}
                width={24}
                height={24}
                className="w-[1.5vw] h-[1.5vw]"
              />
              <span className="text-[0.875vw]">{tech.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {isTechStackModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50">
          <Card className="w-[90vw] max-w-[30vw] p-[1.5vw]">
            <h2 className="text-[1.25vw] font-semibold mb-[1vw]">Add Skills</h2>
            <div className="space-y-[1vw]">
              <Select
                onValueChange={(value) => {
                  if (!selectedTech.includes(value)) {
                    setSelectedTech([...selectedTech, value]);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {availableTechStack.map((tech) => (
                    <SelectItem key={tech.name} value={tech.name}>
                      <div className="flex items-center gap-[0.5vw]">
                        <Image
                          src={tech.image}
                          alt={tech.name}
                          width={24}
                          height={24}
                          className="w-[1.5vw] h-[1.5vw]"
                        />
                        <span>{tech.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Skills */}
              <div className="flex flex-wrap gap-[0.5vw]">
                {selectedTech.map((techName) => {
                  const tech = availableTechStack.find(
                    (t) => t.name === techName
                  );
                  return tech ? (
                    <div
                      key={tech.name}
                      className="flex items-center gap-[0.5vw] p-[0.5vw] bg-gray-100 rounded-[0.417vw]"
                    >
                      <Image
                        src={tech.image}
                        alt={tech.name}
                        width={24}
                        height={24}
                        className="w-[1.5vw] h-[1.5vw]"
                      />
                      <span className="text-[0.875vw]">{tech.name}</span>
                      <button
                        onClick={() =>
                          setSelectedTech(
                            selectedTech.filter((t) => t !== tech.name)
                          )
                        }
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="mt-[1.5vw] flex justify-end gap-[1vw]">
              <Button
                variant="default"
                className="bg-gray-500 hover:bg-gray-600 text-white text-[0.875vw]"
                onClick={() => {
                  setIsTechStackModalOpen(false);
                  setSelectedTech([]);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-[#26A4FF] hover:bg-[#1a8cd8] text-white text-[0.875vw]"
                onClick={() => setIsConfirmTechOpen(true)}
                disabled={selectedTech.length === 0}
              >
                Add Selected Skills
              </Button>
            </div>
          </Card>
        </div>
      )}

      <AlertDialog open={isConfirmTechOpen} onOpenChange={setIsConfirmTechOpen}>
        <AlertDialogOverlay className="bg-black/50 fixed inset-0" />
        <AlertDialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[30vw] max-w-none z-50 bg-white rounded-[0.8vw] p-[1.5vw] shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[1.5vw] font-semibold mb-[1vw]">
              Confirm Add Skills
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[1vw]">
              Are you sure you want to add these skills to your profile?
            </AlertDialogDescription>
            <div className="mt-[1vw] space-y-[0.5vw]">
              {selectedTech.map((techName) => {
                const tech = availableTechStack.find(
                  (t) => t.name === techName
                );
                return tech ? (
                  <div
                    key={tech.name}
                    className="flex items-center gap-[0.5vw] p-[0.5vw] bg-gray-100 rounded-[0.417vw]"
                  >
                    <Image
                      src={tech.image}
                      alt={tech.name}
                      width={24}
                      height={24}
                      className="w-[1.5vw] h-[1.5vw]"
                    />
                    <span className="text-[0.875vw]">{tech.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-[1vw]">
            <AlertDialogCancel
              className="text-[0.8vw]"
              onClick={() => setIsConfirmTechOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAddTechStack}
              disabled={isLoadingTech}
              className="bg-[#38BDF8] hover:bg-[#32a8dd] text-[0.8vw]"
            >
              {isLoadingTech ? (
                <div className="flex items-center gap-[0.417vw]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-[0.833vw] h-[0.833vw] border-[0.208vw] border-white border-t-transparent rounded-full"
                  />
                  Adding...
                </div>
              ) : (
                "Confirm Add"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
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
                {confirmationType === "profile"
                  ? "Confirm Profile Update"
                  : "Confirm Password Change"}
              </AlertDialogTitle>
              <div className="space-y-[1vw]">
                <AlertDialogDescription className="text-[1vw]">
                  {confirmationType === "profile"
                    ? "Are you sure you want to update your profile with these changes?"
                    : "Are you sure you want to change your password?"}
                </AlertDialogDescription>
                {confirmationType === "profile" && (
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
                      <strong>Phone:</strong> {formData.phone}
                    </div>
                    <div>
                      <strong>Skill:</strong> {formData.skill}
                    </div>
                  </motion.div>
                )}
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-[1vw]">
              <AlertDialogCancel
                disabled={isSubmitting}
                className="text-[0.8vw]"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={
                  confirmationType === "profile"
                    ? handleSave
                    : handlePasswordChange
                }
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
                      className="w-[0.833vw] h-[0.833vw] border-[0.208vw] border-white border-t-transparent rounded-full"
                    />
                    {confirmationType === "profile"
                      ? "Updating..."
                      : "Changing..."}
                  </div>
                ) : confirmationType === "profile" ? (
                  "Confirm Update"
                ) : (
                  "Confirm Change"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
