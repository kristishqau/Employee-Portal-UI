export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export const DEMO_USERS = {
  admin: {
    id: '1',
    userName: 'admin',
    role: 'Administrator',
    profilePictureUrl: undefined,
  },
  employee: {
    id: '2',
    userName: 'employee',
    role: 'Employee',
    profilePictureUrl: undefined,
  },
};

export const MOCK_PROJECTS = [
  { id: 1, name: 'Website Redesign', description: 'Modernize company website with new design system' },
  { id: 2, name: 'Mobile App', description: 'Build iOS and Android mobile applications' },
  { id: 3, name: 'API Integration', description: 'Integrate third-party payment APIs' },
  { id: 4, name: 'Database Migration', description: 'Migrate from MySQL to PostgreSQL' },
];

export const MOCK_TASKS = [
  { id: 1, title: 'Design homepage mockup', description: 'Create Figma designs for new homepage', isFinished: true, assignedUserId: 2, assignedUserName: 'employee', projectId: 1 },
  { id: 2, title: 'Implement login page', description: 'Build responsive login with validation', isFinished: false, assignedUserId: 2, assignedUserName: 'employee', projectId: 1 },
  { id: 3, title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for deployment', isFinished: false, assignedUserId: 1, assignedUserName: 'admin', projectId: 1 },
  { id: 4, title: 'iOS app prototype', description: 'Build initial prototype in Swift', isFinished: false, assignedUserId: 2, assignedUserName: 'employee', projectId: 2 },
  { id: 5, title: 'Payment gateway integration', description: 'Integrate Stripe payment API', isFinished: true, assignedUserId: 1, assignedUserName: 'admin', projectId: 3 },
  { id: 6, title: 'Database schema design', description: 'Design new PostgreSQL schema', isFinished: false, assignedUserId: 2, assignedUserName: 'employee', projectId: 4 },
];

export const MOCK_USERS = [
  { id: 1, userName: 'admin', role: 'Administrator', profilePictureUrl: undefined },
  { id: 2, userName: 'employee', role: 'Employee', profilePictureUrl: undefined },
  { id: 3, userName: 'john_dev', role: 'Employee', profilePictureUrl: undefined },
  { id: 4, userName: 'sarah_manager', role: 'Administrator', profilePictureUrl: undefined },
];

// Helper to get user's projects (for employee view)
export const getUserProjects = (userId: number) => {
  if (userId === 1) return MOCK_PROJECTS; // Admin sees all
  return MOCK_PROJECTS.filter(p => [1, 2, 4].includes(p.id)); // Employee sees subset
};

// Helper to get user's tasks
export const getUserTasks = (userId: number) => {
  if (userId === 1) return MOCK_TASKS; // Admin sees all
  const userProjectIds = getUserProjects(userId).map(p => p.id);
  return MOCK_TASKS.filter(t => userProjectIds.includes(t.projectId!));
};

// Helper to get project tasks
export const getProjectTasks = (projectId: number) => {
  return MOCK_TASKS.filter(t => t.projectId === projectId);
};

// Helper to get project users
export const getProjectUsers = (projectId: number) => {
  // In demo, projects 1, 2, 4 have employee
  if ([1, 2, 4].includes(projectId)) {
    return MOCK_USERS.filter(u => [1, 2].includes(u.id));
  }
  return MOCK_USERS.filter(u => u.id === 1); // Only admin
};