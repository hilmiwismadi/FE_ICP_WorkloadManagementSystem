"use client";

import { useAuth } from './context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from './organisms/LoadingScreen';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingScreen />

  return <>{children}</>;
};

export default ProtectedRoute;
