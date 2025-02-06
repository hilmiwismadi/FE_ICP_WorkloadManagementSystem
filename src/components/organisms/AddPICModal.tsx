import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
  role: string;
}

interface Employee {
  employee_Id: string;
  name: string;
  image: string;
  phone: string;
  team: string;
  skill: string;
  current_Workload: number;
  start_Date: string;
  users: User[];
}

interface ApiResponse {
  data: Employee[];
}

interface JwtPayload {
  role: string;
  user_Id: string;
}

interface PromotePICModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackState {
  show: boolean;
  success: boolean;
  message: string;
}

const PromotePICModal: React.FC<PromotePICModalProps> = ({ isOpen, onClose }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ 
    show: false, 
    success: false, 
    message: '' 
  });
  const [managerData, setManagerData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const authToken = Cookies.get('auth_token');
    if (authToken) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(authToken);
        if (decodedToken.role === 'Manager') {
          setManagerData(decodedToken.user_Id);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://be-icpworkloadmanagementsystem.up.railway.app/api/emp/read');
        const result: ApiResponse = await response.json();
        
        if (result && Array.isArray(result.data)) {
          // Filter out employees who are already PICs
          const nonPICEmployees = result.data.filter(emp => 
            emp.users.some(user => user.role === 'Employee')
          );
          setEmployees(nonPICEmployees);
        } else {
          console.error('Invalid API response format:', result);
          setEmployees([]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) {
      return "https://utfs.io/f/B9ZUAXGX2BWYfKxe9sxSbMYdspargO3QN2qImSzoXeBUyTFJ";
    }
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    if (imageUrl.startsWith("/uploads")) {
      return `https://be-icpworkloadmanagementsystem.up.railway.app/api${imageUrl}`;
    }
    return imageUrl;
  };

  const filteredEmployees = employees.length > 0 
    ? employees
        .filter(emp => 
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10)
    : [];

  const handlePromote = async () => {
    if (!selectedEmployee) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://be-icpworkloadmanagementsystem.up.railway.app/api/user/updateRole/${managerData}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_Id: selectedEmployee.employee_Id,
            role: "PIC",
          }),
        }
      );

      if (response.ok) {
        setFeedback({
          show: true,
          success: true,
          message: 'Employee successfully promoted to PIC!'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setFeedback({
          show: true,
          success: false,
          message: 'Failed to promote employee. Please try again.'
        });
      }
    } catch (error) {
      setFeedback({
        show: true,
        success: false,
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-[35vw] max-h-[80vh] overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[1.2vw] font-semibold">Promote to PIC</h2>
              <button onClick={onClose}>
                <X className="w-[1.2vw] h-[1.2vw] text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            
            <div className="h-[0.1vw] bg-gray-200 mb-4" />

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-[1vw] h-[1vw]" />
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full pl-[2.5vw] pr-[1vw] py-[0.8vw] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-[40vh] overflow-y-auto pr-2">
      {filteredEmployees.map((emp) => (
        <motion.div
          key={emp.employee_Id}
          initial={{ backgroundColor: 'transparent' }}
          whileHover={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            scale: 1.01,
          }}
          transition={{ duration: 0.2 }}
          className={`
            flex items-center justify-between
            p-4 mb-2 rounded-lg cursor-pointer
            border transition-all duration-200
            ${selectedEmployee?.employee_Id === emp.employee_Id 
              ? 'bg-blue-50 border-blue-200 shadow-sm' 
              : 'border-transparent hover:border-blue-100'
            }
          `}
          onClick={() => setSelectedEmployee(emp)}
        >
          <div className="flex items-center flex-1">
            <div className="relative">
              <img
                src={getImageUrl(emp.image)}
                alt={emp.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
              />
              {selectedEmployee?.employee_Id === emp.employee_Id && (
                <div className="absolute -right-1 -bottom-1 bg-blue-500 rounded-full p-1">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-base font-medium text-gray-900">{emp.name}</div>
              <div className="text-sm text-gray-500 flex items-center">
                <span>{emp.team}</span>
                <span className="mx-2">•</span>
                <span>{emp.skill}</span>
              </div>
            </div>
          </div>
          
          {selectedEmployee?.employee_Id === emp.employee_Id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-4 text-blue-500 font-medium text-sm"
            >
              Selected
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>

            <button
              className={`w-full py-[0.8vw] rounded-lg text-white text-[1vw] font-medium transition-colors
                ${selectedEmployee 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'}`}
              onClick={() => selectedEmployee && setShowConfirmation(true)}
              disabled={!selectedEmployee}
            >
              Select Employee
            </button>
          </motion.div>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {showConfirmation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowConfirmation(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg p-6 w-[30vw]"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <AlertCircle className="w-[4vw] h-[4vw] text-blue-600 mx-auto mb-4" />
                    <h3 className="text-[1.2vw] font-semibold mb-2">Confirm Promotion</h3>
                    <p className="text-[1vw] text-gray-600 mb-6">
                      Are you sure you want to promote <strong>{selectedEmployee?.name}</strong> to <strong>PIC?</strong>
                    </p>
                    <div className="flex gap-[1vw] justify-center">
                      <button
                        className="px-[2vw] py-[0.8vw] rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                        onClick={() => setShowConfirmation(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-[2vw] py-[0.8vw] rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                        onClick={handlePromote}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Promoting...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Toast */}
          <AnimatePresence>
            {feedback.show && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className={`fixed bottom-[2vw] right-[2vw] p-[1vw] rounded-lg shadow-lg flex items-center gap-[0.8vw]
                  ${feedback.success ? 'bg-green-100' : 'bg-red-100'}`}
              >
                {feedback.success ? (
                  <CheckCircle2 className={`w-[1.5vw] h-[1.5vw] ${feedback.success ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <AlertCircle className={`w-[1.5vw] h-[1.5vw] ${feedback.success ? 'text-green-600' : 'text-red-600'}`} />
                )}
                <span className={`text-[1vw] ${feedback.success ? 'text-green-800' : 'text-red-800'}`}>
                  {feedback.message}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotePICModal;