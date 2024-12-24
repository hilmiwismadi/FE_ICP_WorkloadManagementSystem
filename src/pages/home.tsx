"use client";
import "../App/globals.css";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full bg-white aspect-[1920/1080] flex justify-center items-center relative">
      <div className="absolute left-0 w-[19.583vw] aspect-[376/1080] text-[10vw] flex flex-col  items-center bg-navy">
        <Image
          src="/img/sidebar/Logo_IconPlus.png"
          alt="logo"
          width={2000}
          height={2000}
          className="w-[9.792vw] mt-[3vw]"
        />

        <div className="bg-[#243F80] rounded-lg aspect-[280/150] w-[14.583vw] my-[2vw] flex justify-center items-center gap-x-[1vw]">
          <Image
            src="/img/sidebar/UserProfile.png"
            alt="logo"
            width={2000}
            height={2000}
            className="w-[4.427vw] aspect-square rounded-[10.417vw]"
          />
          <div className="flex flex-col font-semibold text-[1.146vw] gap-[0.7vw]">
            <h1>PIC APKT</h1>
            <h1>ID-10009</h1>
          </div>
        </div>

        <div className="aspect-[376/33] w-[19.583vw] flex">
        <image>
            
        </image>

        </div>

      </div>
    </div>
  );
}
