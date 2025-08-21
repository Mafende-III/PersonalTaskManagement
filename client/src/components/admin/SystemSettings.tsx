import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { FiUsers, FiFolder, FiBriefcase, FiDatabase } from 'react-icons/fi';

interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalDepartments: number;
  activeUsers: number;
  pendingUsers: number;
}

const SystemSettings: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    totalDepartments: 0,
    activeUsers: 0,
    pendingUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      // For now, we'll calculate these from the available data
      const [usersRes, departmentsRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }),
        fetch('/api/admin/departments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        })
      ]);

      const usersData = await usersRes.json();
      const departmentsData = await departmentsRes.json();

      if (usersData.success && departmentsData.success) {
        const users = usersData.data.users;
        const departments = departmentsData.data.departments;
        
        const totalProjects = users.reduce((sum: number, user: any) => sum + (user._count?.projects || 0), 0);
        const totalTasks = users.reduce((sum: number, user: any) => sum + (user._count?.tasks || 0), 0);
        
        setStats({
          totalUsers: users.length,
          totalProjects,
          totalTasks,
          totalDepartments: departments.length,
          activeUsers: users.filter((u: any) => u.accountStatus === 'ACTIVE').length,
          pendingUsers: users.filter((u: any) => u.accountStatus === 'PENDING_VERIFICATION' || u.accountStatus === 'UNASSIGNED').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading system information...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
        <p className="text-sm text-gray-600 mt-1">
          System statistics and health information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiFolder className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiDatabase className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <FiBriefcase className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDepartments}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Environment</span>
              <span className="font-medium">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database</span>
              <span className="font-medium">PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Authentication</span>
              <span className="font-medium">JWT</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              • Use the Users tab to manage user accounts and assignments
            </p>
            <p className="text-sm text-gray-600">
              • Use the Departments tab to create and manage organizational structure
            </p>
            <p className="text-sm text-gray-600">
              • Use the Positions tab to define roles and permissions
            </p>
            <p className="text-sm text-gray-600">
              • System settings and configurations can be managed through this interface
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettings; 