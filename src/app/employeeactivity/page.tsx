"use client";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Sidebar from "../../components/sidebar";


export default function EmployeeActivity() {
  return (
    <div className="w-full bg-white h-screen aspect-[1920/1080] text-[10vw] text-red-500 flex justify-center items-center relative">
        <Sidebar />
        Employee Activity
    </div>
  );
}
