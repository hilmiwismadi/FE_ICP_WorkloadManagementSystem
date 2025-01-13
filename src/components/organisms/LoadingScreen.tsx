"use client";

import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [countdown, setCountdown] = useState(5); // Match the 2000ms timeout

  useEffect(() => {
    let mounted = true;

    const mount = () => {
      if (mounted) {
        setIsMounted(true);
      }
    };

    mount();

    const timer = setInterval(() => {
      if (mounted) {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  const particles = [
    { left: "20%", top: "20%", delay: "0s", duration: "1.5s" },
    { left: "80%", top: "30%", delay: "0.2s", duration: "2s" },
    { left: "40%", top: "70%", delay: "0.4s", duration: "1.8s" },
    { left: "65%", top: "65%", delay: "0.6s", duration: "2.2s" },
    { left: "30%", top: "40%", delay: "0.8s", duration: "1.7s" },
    { left: "70%", top: "80%", delay: "1s", duration: "1.9s" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      {/* Container for the loading animation */}
      <div className="relative">
        {/* Outer glow effect */}
        <div className="absolute inset-0 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-yellow-300/20 blur-xl" />
        </div>

        {/* Lightning icon with animation */}
        <div className="animate-bounce">
          <div className="relative">
            <Zap size={64} className="text-yellow-300 animate-pulse" />
            {/* Inner lightning glow */}
            <div className="absolute inset-0 animate-pulse">
              <Zap size={64} className="text-yellow-300 blur-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading text with countdown */}
      <div className="mt-8 flex flex-col items-center space-y-2">
        <div className="text-xl font-semibold text-yellow-300 animate-pulse">
          Loading....
        </div>
        {/* <div className="text-lg text-yellow-200">
          Authenticating in {countdown}s
        </div> */}
      </div>

      {/* Electric particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300/60 rounded-full animate-ping"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
