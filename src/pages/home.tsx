"use client";
import "../App/globals.css";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Sidebar from "../components/sidebar";


export default function Home() {
  return (
    <div className="w-full bg-white h-screen aspect-[1920/1080] text-[10vw] text-red-500 flex justify-center items-center relative">
        <Sidebar />
        HOME
    </div>
  );
}
