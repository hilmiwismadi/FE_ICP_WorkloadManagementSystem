import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PencilIcon, Lock } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { parse } from "cookie";

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

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setFormData({
      name: employee.name,
      email: employee.users[0]?.email || "",
      phone: employee.phone,
      skill: employee.skill,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: employee.name,
      email: employee.users[0]?.email || "",
      phone: employee.phone,
      skill: employee.skill,
    });
  };

  const handleSave = async () => {
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
        alert("Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    try {
      // Get the token from cookies
      const cookies = document.cookie;
      const parsedCookies = parse(cookies);
      const token = parsedCookies.auth_token;

      if (!token) {
        setPasswordError("User is not authenticated");
        return;
      }

      // Decode the token to get the user_Id
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.user_Id;

      console.log(userId);

      if (!userId) {
        setPasswordError("Invalid token: user ID not found");
        return;
      }

      // Send the password update request
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
        alert("Password changed successfully!");
        setIsPasswordModalOpen(false);
        setPasswordForm({
          previousPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await response.json();
        setPasswordError(
          typeof data.error === "string"
            ? data.error
            : "Failed to change password"
        );
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("An error occurred while changing the password");
    }
  };

  return (
    <div className="w-full">
      {/* Profile Header */}
      <div className="bg-[#15234A] rounded-t-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image
                src={employee.image || "/img/sidebar/UserProfile.png"}
                alt="Profile"
                fill
                className="rounded-full object-cover"
                priority
              />
            </div>
            <div>
              <h2 className="text-xl font-medium">{employee.name}</h2>
              <p className="text-sm text-gray-300">ID-{employee.employee_Id}</p>
              <p className="text-sm text-gray-300">{employee.users[0]?.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="bg-[#26A4FF] hover:bg-[#1a8cd8] text-white flex items-center gap-2"
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
              } text-white flex items-center gap-2`}
              onClick={handleEditToggle}
            >
              <PencilIcon size={16} />
              {isEditing ? "Editing" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <Card className="mt-6 p-6 space-y-6">
        <div className="space-y-4">
          {Object.entries(formData).map(([field, value]) => (
            <div key={field}>
              <h3 className="text-sm font-medium mb-2">
                Employee {field.charAt(0).toUpperCase() + field.slice(1)}
              </h3>
              {isEditing ? (
                <input
                  type="text"
                  name={field}
                  value={value}
                  onChange={handleInputChange}
                  className="w-full bg-gray-100 p-3 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#26A4FF]"
                />
              ) : (
                <div className="bg-gray-100 p-3 rounded-md text-gray-600">
                  {value}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Save & Cancel Buttons */}
      {isEditing && (
        <div className="mt-6 flex justify-end gap-4">
          <Button
            variant="default"
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      )}

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50">
          <Card className="w-[90vw] max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            {passwordError && typeof passwordError === "string" && (
              <p className="text-red-500 mb-4 text-sm">{passwordError}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Previous Password</label>
                <input
                  type="password"
                  name="previousPassword"
                  value={passwordForm.previousPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full mt-1 bg-gray-100 p-3 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#26A4FF]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full mt-1 bg-gray-100 p-3 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#26A4FF]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full mt-1 bg-gray-100 p-3 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#26A4FF]"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <Button
                variant="default"
                className="bg-gray-500 hover:bg-gray-600 text-white"
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
                className="bg-[#26A4FF] hover:bg-[#1a8cd8] text-white"
                onClick={handlePasswordChange}
              >
                Change Password
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
