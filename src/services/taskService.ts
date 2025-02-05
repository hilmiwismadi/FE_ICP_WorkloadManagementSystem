export async function fetchTasks(userId: string) {
  try {
    const response = await fetch(`https://be-icpworkloadmanagementsystem.up.railway.app/api/tasks/read/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any required headers like authentication tokens here
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }
    const data = await response.json();
    
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
    return transformedData;
  } catch (error) {
    console.error('Error details:', error);
    return [];
  }
} 