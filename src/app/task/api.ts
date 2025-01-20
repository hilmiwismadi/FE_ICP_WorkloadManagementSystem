import axios from 'axios';

const BASE_URL = 'https://be-icpworkloadmanagementsystem.up.railway.app/api';

export const taskService = {
    getAllTasks: async () => {
      const response = await axios.get(`${BASE_URL}/task/read`);
      return response.data;
    },
  
    getTasksByEmployee: async (empId: string) => {
      const response = await axios.get(`${BASE_URL}/task/read/${empId}`);
      return response.data;
    },
  
    createTask: async (userId: string, taskData: any) => {
      const response = await axios.post(`${BASE_URL}/task/add/${userId}`, taskData);
      return response.data;
    },
  
    updateTask: async (taskId: string, taskData: any) => {
      const response = await axios.put(`${BASE_URL}/task/edit/${taskId}`, taskData);
      return response.data;
    },
  
    deleteTask: async (taskId: string) => {
      const response = await axios.delete(`${BASE_URL}/task/delete/${taskId}`);
      return response.data;
    },
  
    createSubtask: async (userId: string, subtaskData: any) => {
      const response = await axios.post(`${BASE_URL}/subtasks/add/${userId}`, subtaskData);
      return response.data;
    },
  };