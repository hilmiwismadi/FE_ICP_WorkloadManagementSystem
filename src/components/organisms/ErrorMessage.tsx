import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
  }

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, message, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 text-red-500">
              <AlertCircle size={40} />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Occurred
            </h3>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            
            <Button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-6"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ErrorModal;