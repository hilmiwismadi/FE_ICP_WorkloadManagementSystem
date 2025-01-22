"use client";

import Sidebar from "@/components/sidebar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EditUserProfile from "../edit-user-profile";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import axios from "axios";
import ProtectedRoute from "@/components/protected-route";

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
  users: Array<{
    user_Id: string;
    email: string;
    role: string;
  }>;
}

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ";
  }
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads")) {
    return `https://be-icpworkloadmanagementsystem.up.railway.app/api${imageUrl}`;
  }
  return imageUrl;
};

export default function EditProfilePage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read/${id}`
        );
        if (response.data && response.data.data) {
          const employeeData = {
            ...response.data.data,
            image: getImageUrl(response.data.data.image),
          };
          setEmployee(employeeData);
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  const handleSaveProfile = async (formData: FormData) => {
    try {
      const response = await axios.put(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        const updatedEmployee = {
          ...response.data.data,
          image: getImageUrl(response.data.data.image),
        };
        setEmployee(updatedEmployee);
        setSelectedImage(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return false;
    }
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-grow overflow-auto flex items-start justify-center">
          <div className="flex-1 max-h-screen w-[80vw] ml-[0.417vw] py-[1vw] px-[1.667vw] space-y-[1.25vw]">
            {employee && (
              <EditUserProfile
                employee={employee}
                onSave={handleSaveProfile}
                onImageChange={handleImageChange}
                selectedImage={selectedImage}
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
