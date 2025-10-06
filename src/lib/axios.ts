import axios from 'axios';
import { DEMO_MODE, MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS, getUserProjects, getUserTasks } from './demoMode';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Store mock data in memory so it persists during the session
const mockData = {
  tasks: [...MOCK_TASKS],
  projects: [...MOCK_PROJECTS],
  users: [...MOCK_USERS]
};

// Mock API response handler for demo mode
if (DEMO_MODE) {
  api.interceptors.request.use(async (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id ? Number(user.id) : null;
    const isAdmin = user?.role === 'Administrator';

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // GET requests
    if (config.method?.toLowerCase() === 'get') {
      let responseData = null;

      // Projects endpoints
      if (config.url === '/api/Project') {
        responseData = isAdmin ? mockData.projects : getUserProjects(userId);
      }
      else if (config.url === '/api/Project/GetProjectsForUser') {
        responseData = getUserProjects(userId);
      }
      // Tasks endpoints
      else if (config.url === '/api/Task') {
        responseData = isAdmin ? mockData.tasks : getUserTasks(userId);
      }
      else if (config.url?.startsWith('/api/Project/') && config.url.endsWith('/tasks')) {
        const projectId = Number(config.url.split('/')[3]);
        responseData = mockData.tasks.filter(t => t.projectId === projectId);
      }
      // Users endpoint
      else if (config.url === '/api/User') {
        responseData = mockData.users;
      }

      if (responseData !== null) {
        throw new axios.Cancel('Demo mode response: ' + JSON.stringify(responseData));
      }
    }

    // POST requests
    if (config.method?.toLowerCase() === 'post') {
      const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      
      if (config.url === '/api/Task') {
        const newTask = {
          id: mockData.tasks.length + 1,
          ...data,
          assignedUserId: Number(config.params?.userId),
          assignedUserName: mockData.users.find(u => u.id === Number(config.params?.userId))?.userName,
          projectId: Number(config.params?.projectId)
        };
        mockData.tasks.push(newTask);
        throw new axios.Cancel('Demo mode response: ' + JSON.stringify(newTask));
      }
      else if (config.url === '/api/Project') {
        const newProject = {
          id: mockData.projects.length + 1,
          ...data
        };
        mockData.projects.push(newProject);
        throw new axios.Cancel('Demo mode response: ' + JSON.stringify(newProject));
      }
    }

    // PUT requests
    if (config.method?.toLowerCase() === 'put' && config.url?.startsWith('/api/Task/')) {
      const taskId = Number(config.url.split('/')[3]);
      const taskIndex = mockData.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        mockData.tasks[taskIndex] = { ...mockData.tasks[taskIndex], ...data };
        throw new axios.Cancel('Demo mode response: ' + JSON.stringify(mockData.tasks[taskIndex]));
      }
    }

    // DELETE requests
    if (config.method?.toLowerCase() === 'delete' && config.url?.startsWith('/api/Task/')) {
      const taskId = Number(config.url.split('/')[3]);
      const taskIndex = mockData.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        mockData.tasks.splice(taskIndex, 1);
        throw new axios.Cancel('Demo mode response: {}');
      }
    }

    return config;
  });

  // Handle the cancelled requests and return mock data
  api.interceptors.response.use(
    response => response,
    error => {
      if (axios.isCancel(error) && error.message.startsWith('Demo mode response: ')) {
        return {
          data: JSON.parse(error.message.replace('Demo mode response: ', '')),
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        };
      }
      return Promise.reject(error);
    }
  );
}

export default api;