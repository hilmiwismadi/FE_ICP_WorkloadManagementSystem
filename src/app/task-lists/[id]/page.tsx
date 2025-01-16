"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/sidebar";
import ProtectedRoute from "@/components/protected-route";
import LoadingScreen from "@/components/organisms/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TaskList = () => {
  const [view, setView] = useState('weekly');
  const [status, setStatus] = useState('ongoing');
  const [period, setPeriod] = useState('weekly');
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date('2016-01-01'));

  // Generate dates for grid
  const getDatesForGrid = () => {
    const dates = [];
    const tempDate = new Date(currentDate);
    const daysToShow = view === 'weekly' ? 7 : new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();

    for (let i = 0; i < daysToShow; i++) {
      dates.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return dates;
  };

  // Sample ongoing tasks for the right panel
  const ongoingTasks = [
    {
      id: 1,
      title: 'Fix Bug API Endpoint',
      description: 'Bertanggung jawab menyelesaikan bug Aplikasi pada sisi Backend serama 2 karyawan lain',
      dueDate: '14/01/2025',
      priority: 8.2
    },
    {
      id: 2,
      title: 'Fix Bug API Endpoint',
      description: 'Bertanggung jawab menyelesaikan bug Aplikasi pada sisi Backend serama 2 karyawan lain',
      dueDate: '16/01/2025',
      priority: 4.1
    },
    {
      id: 3,
      title: 'Fix Bug API Endpoint',
      description: 'Bertanggung jawab menyelesaikan bug Aplikasi pada sisi Backend serama 2 karyawan lain',
      dueDate: '12/01/2025',
      priority: 2.1
    }
  ];

  // Tasks data with proper date handling
  const tasks = [
    {
      id: 1,
      name: 'Backend Development',
      status: 'ongoing',
      startDate: new Date('2016-01-01'),
      endDate: new Date('2016-01-15'),
      progress: 75,
      details: 'API development and database optimization'
    },
    // ... (previous tasks data remains the same)
  ];

  // Calculate task position and width based on dates
  const getTaskStyle = (task) => {
    const gridDates = getDatesForGrid();
    const gridStart = gridDates[0];
    const gridEnd = gridDates[gridDates.length - 1];
    
    // Calculate position
    const startOffset = Math.max(0, (task.startDate - gridStart) / (gridEnd - gridStart));
    const duration = Math.min(
      (task.endDate - task.startDate) / (gridEnd - gridStart),
      1 - startOffset
    );

    return {
      left: `${startOffset * 100}%`,
      width: `${duration * 100}%`,
    };
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-grow overflow-auto">
          <div className="max-w-[80vw] mx-auto py-6 px-8 space-y-6">
            {/* Header Section with Filters */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button 
                  variant={view === 'weekly' ? 'default' : 'outline'}
                  onClick={() => setView('weekly')}
                  className="bg-blue-400 text-white hover:bg-blue-500"
                >
                  Weekly
                </Button>
                <Button 
                  variant={view === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setView('monthly')}
                  className="bg-blue-400 text-white hover:bg-blue-500"
                >
                  Monthly
                </Button>
              </div>
              <div className="flex gap-4">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="ongoing">On Going</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex gap-6">
              {/* Gantt Chart Section */}
              <div className="flex-grow">
                <Card>
                  <CardContent className="p-6">
                    <div className="relative">
                      {/* Grid Header */}
                      <div className="grid" style={{
                        gridTemplateColumns: `repeat(${view === 'weekly' ? 7 : 31}, 1fr)`
                      }}>
                        {getDatesForGrid().map((date, index) => (
                          <div key={index} className="text-center text-sm text-gray-500 border-r border-gray-200 pb-2">
                            {date.getDate()}
                          </div>
                        ))}
                      </div>

                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid" style={{
                        gridTemplateColumns: `repeat(${view === 'weekly' ? 7 : 31}, 1fr)`,
                        top: '2rem'
                      }}>
                        {getDatesForGrid().map((_, index) => (
                          <div key={index} className="border-r border-gray-200 h-full" />
                        ))}
                      </div>

                      {/* Tasks */}
                      <div className="relative mt-4 space-y-2">
                        {tasks.map(task => (
                          <div 
                            key={task.id}
                            className="h-8 relative cursor-pointer group"
                            onClick={() => setSelectedTask(task)}
                          >
                            <div
                              className="absolute h-full bg-blue-400 rounded transition-all hover:h-10 hover:-top-1"
                              style={getTaskStyle(task)}
                            >
                              <div className="px-2 text-white truncate text-sm">
                                {task.name}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Navigation */}
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"
                        onClick={() => {
                          const newDate = new Date(currentDate);
                          newDate.setDate(newDate.getDate() - (view === 'weekly' ? 7 : 31));
                          setCurrentDate(newDate);
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"
                        onClick={() => {
                          const newDate = new Date(currentDate);
                          newDate.setDate(newDate.getDate() + (view === 'weekly' ? 7 : 31));
                          setCurrentDate(newDate);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Task Details */}
                {selectedTask && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Task Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-semibold">{selectedTask.name}</p>
                        <p className="text-sm text-gray-600">{selectedTask.details}</p>
                        <div className="flex gap-4 text-sm">
                          <span>Start: {selectedTask.startDate.toLocaleDateString()}</span>
                          <span>End: {selectedTask.endDate.toLocaleDateString()}</span>
                          <span className="capitalize">Status: {selectedTask.status}</span>
                          <span>Progress: {selectedTask.progress}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Tasks Panel */}
              <div className="w-80">
                <Card>
                  <CardHeader>
                    <CardTitle>Ongoing Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ongoingTasks.map(task => (
                        <Card key={task.id}>
                          <CardContent className="p-4">
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm">Due: {task.dueDate}</span>
                              <span className={`px-2 py-1 rounded-full text-white text-sm ${
                                task.priority > 7 ? 'bg-red-500' :
                                task.priority > 4 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TaskList;