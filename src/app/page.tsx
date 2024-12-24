import React from "react";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {
  return (
    <div className="w-full bg-white aspect-[1920/1080] flex justify-center items-center">
      <div className="w-[80%] h-[600px] flex justify-between items-center">
        {/* Left Image Placeholder */}
        <div className=" mx-[5vw] relative w-[30.208vw] aspect-square border-4 border-black"></div>

        <div className="mx-[5vw] aspect-[530/450] w-[27.604vw] flex flex-col">
          <div className="font-Poppins text-[1.25vw] text-black ">
            <h1 className="my-[0.5vw]">Username</h1>
            <input
              type="text"
              placeholder="........"
              className="w-full aspect-[530/54] border-[0.2vw] border-gray-400 rounded-[0.781vw] my-[0.7vw] px-[1vw] text-[1vw] focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="font-Poppins text-[1.25vw] text-black ">
            <h1 className="my-[0.5vw]">Password</h1>
            <input
              type="text"
              placeholder="........"
              className="w-full aspect-[530/54] border-[0.2vw] border-gray-400 rounded-[0.781vw] my-[0.7vw] px-[1vw] text-[1vw] focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex aspect-[530/27] gap-x-[0.5vw] my-[2vw]">
            <input
              type="checkbox"
              id="rememberMe"
              className="w-[1.302vw] h-[1.302vw] border-[0.2vw] border-gray-400 rounded-2xl accent-gray-400"
            />
            <h1 className="text-[0.938vw] text-black"> Remember Me</h1>
          </div>
          <a
            className="flex aspect-[530/68] text-white bg-navy rounded-xl justify-center items-center cursor-pointer hover:bg-blue-800 transition-colors"
            href="/dashboard"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
