"use client";
import "../App/globals.css";
import Image from "next/image";
import { Icon } from "@iconify/react";

const side_components = [
  {
    title: "Dashboard",
    jsx: <Icon icon="material-symbols:dashboard" style={{ width: "1.719vw", height: "1.719vw" }} />,
  },
  {
    title: "Employee Activity",
    jsx: <Icon icon="material-symbols:work" style={{ width: "1.719vw", height: "1.719vw" }} />,
  },
  {
    title: "Task Management",
    jsx: <Icon icon="material-symbols:assignment" style={{ width: "1.719vw", height: "1.719vw" }} />,
  },
];

export default function Sidebar() {
  return (
    <div className="absolute left-0 w-[19.583vw] aspect-[376/1080] text-[10vw] flex flex-col items-center bg-navy">
      <Image
        src="/img/sidebar/Logo_IconPlus.png"
        alt="logo"
        width={2000}
        height={2000}
        className="w-[9.792vw] mt-[6vw]"
      />

      <div className="bg-[#243F80] rounded-lg aspect-[280/150] w-[14.583vw] my-[2vw] flex justify-center items-center gap-x-[1.3vw]">
        <Image
          src="/img/sidebar/UserProfile.png"
          alt="logo"
          width={2000}
          height={2000}
          className="w-[4.427vw] aspect-square rounded-[10.417vw]"
        />
        <div className="flex flex-col font-semibold text-[1.146vw] gap-[0.7vw] text-white">
          <h1>PIC APKT</h1>
          <h1>ID-10009</h1>
        </div>
      </div>

      <div className="gap-y-[4.5vw] flex flex-col mt-[3vw]">
        {side_components.map((component, index) => (
          <div
            key={index}
            className="aspect-[376/33] w-[14.583vw] flex text-[1.146vw] font-semibold cursor-pointer hover:text-white active:text-white transition-colors duration-300 text-gray-700"
          >
            <div className="w-[1.719vw] aspect-square flex justify-center items-center">
              {component.jsx}
            </div>
            <h1 className="ml-[1vw]">{component.title}</h1>
          </div>
        ))}

        <div
          className="justify-start items-center aspect-[376/33] w-[14.583vw] flex text-[1.146vw] font-semibold cursor-pointer hover:text-red-600 active:text-red-600 transition-colors duration-300 text-red-900 absolute bottom-[5vw]"
          onClick={() => alert("Clicked!")} // Replace with your click logic
        >
          <Icon icon="streamline:logout-1-solid" style={{ width: "1.719vw", height: "1.719vw" }} />
          <h1 className="ml-[1vw]">Log Out</h1>
        </div>
      </div>
    </div>
  );
}
