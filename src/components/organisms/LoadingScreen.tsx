import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      {/* Circular loader container */}
      <div className="relative w-[5vw] h-[5vw]">
        {/* Light grey circle (base) */}
        <div className="absolute inset-0 rounded-full border-[1vw] border-gray-300/20" />
        
        {/* Yellow rotating circle */}
        <div className="absolute inset-0 rounded-full border-[1vw] border-transparent border-t-yellow-300 animate-spin" />
        
        {/* Blue accent circle */}
        <div className="absolute inset-0 rounded-full border-[1vw] border-transparent border-l-blue-300 animate-spin-slow" />
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;