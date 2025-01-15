import Image from "next/image";
import { useState } from "react";
import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { parse } from "cookie";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PencilIcon, Lock, CheckCircle2 } from "lucide-react";
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

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  phone: string;
  team: string;
  skill: string;
  current_Workload: number;
  start_Date: string;
  users: Array<{
    user_Id: string;
    email: string;
    role: string;
  }>;
}

interface PasswordChangeForm {
  previousPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserProfileProps {
  employee: Employee;
}

export default function EditUserProfile({ employee }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationType, setConfirmationType] = useState<
    "profile" | "password"
  >("profile");
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.users[0]?.email || "",
    phone: employee.phone,
    skill: employee.skill,
  });
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    previousPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const { id } = useParams();

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
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...employee,
            name: formData.name,
            phone: formData.phone,
            skill: formData.skill,
            users: [{ ...employee.users[0], email: formData.email }],
          }),
        }
      );
      if (response.ok) {
        setShowConfirmation(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsEditing(false);
        }, 1500);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="w-full">
      {/* Profile Header */}
      <div className="bg-[#15234A] rounded-t-[0.833vw] p-[1.5vw] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[1vw]">
            <div className="relative w-[3vw] h-[3vw]">
              <Image
                src={employee.image || "/img/sidebar/UserProfile.png"}
                alt="Profile"
                fill
                className="rounded-full object-cover"
                priority
              />
            </div>
            <div>
              <h2 className="text-[1.25vw] font-medium">{employee.name}</h2>
              <p className="text-[0.875vw] text-gray-300">
                ID-{employee.employee_Id}
              </p>
              <p className="text-[0.875vw] text-gray-300">
                {employee.users[0]?.role}
              </p>
            </div>
          </div>
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

      {/* Save & Cancel Buttons */}
      {isEditing && (
        <div className="mt-[1.5vw] flex justify-end gap-[1vw]">
          <Button
            variant="default"
            className="bg-red-500 hover:bg-red-600 text-white text-[0.875vw]"
            onClick={() => {
              setIsEditing(false);
              setFormData({
                name: employee.name,
                email: employee.users[0]?.email || "",
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
                      <strong>Email:</strong> {formData.email}
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
