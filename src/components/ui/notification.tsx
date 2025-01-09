// First create a new file: components/ui/Notification.tsx
import { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Notification = ({ message, type, duration = 3000, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseStyles = "fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300";
  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white"
  };

  if (!isVisible) return null;

  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
      {message}
    </div>
  );
};

export default Notification;