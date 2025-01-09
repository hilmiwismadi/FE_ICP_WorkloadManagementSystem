"use client";

import { useAuth } from './context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/please-login'); // Redirect to a custom message page
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null; // Show nothing while redirecting

  return <>{children}</>;
};

export default ProtectedRoute;
