import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";

interface Employee {
  employee_Id: string;
  name: string;
  image?: string;
  email: string;
  phone: string;
  team: string;
  skill: string;
  role: string;
  current_Workload: number;
  start_Date: string;
}

interface UserProfileProps {
  employee: Employee;
}

export default function EditUserProfile({ employee }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee>(employee);
  const { id } = useParams();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setFormData(employee); // Reset formData when toggling
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(employee); // Reset formData to initial values
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
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

  return (
    <div className="w-full">
      {/* Profile Header */}
      <div className="bg-[#15234A] rounded-t-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image
                src={formData.image || "/img/sidebar/UserProfile.png"}
                alt="Profile"
                fill
                className="rounded-full object-cover"
                priority
              />
            </div>
            <div>
              <h2 className="text-xl font-medium">{formData.name}</h2>
              <p className="text-sm text-gray-300">ID-{formData.employee_Id}</p>
              <p className="text-sm text-gray-300">{formData.role}</p>
            </div>
          </div>
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

      {/* Profile Details */}
      <Card className="mt-6 p-6 space-y-6">
        <div className="space-y-4">
          {["name", "email", "phone", "skill"].map((field) => (
            <div key={field}>
              <h3 className="text-sm font-medium mb-2">Employee {field.charAt(0).toUpperCase() + field.slice(1)}</h3>
              {isEditing ? (
                <input
                  type="text"
                  name={field}
                  value={formData[field as keyof Employee]}
                  onChange={handleInputChange}
                  className="w-full bg-gray-100 p-3 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#26A4FF]"
                />
              ) : (
                <div className="bg-gray-100 p-3 rounded-md text-gray-600">
                  {formData[field as keyof Employee]}
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
    </div>
  );
}
