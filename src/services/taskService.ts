export async function fetchTasks(userId: string) {
  try {
    console.log('Fetching tasks for userId:', userId);
    const response = await fetch(`https://be-icpworkloadmanagementsystem.up.railway.app/api/tasks/read/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any required headers like authentication tokens here
      },
    });
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }
    const data = await response.json();
    console.log('Raw API response:', data);
    
    // Transform the API response to match our Task interface
    const transformedData = data.map((task: any) => ({
      id: task.task_Id,
      title: task.title,
      startDate: new Date(task.start_Date),
      endDate: new Date(task.end_Date),
      workload: task.workload.toString(),
      urgency: task.priority.toLowerCase(),
      description: task.description,
      priority: task.workload.toString(),
      status: task.status.toLowerCase() as 'ongoing' | 'done' | 'approved',
      type: task.type,
      userId: task.user_Id
    }));
    console.log('Transformed tasks:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error details:', error);
    return [];
  }
} 