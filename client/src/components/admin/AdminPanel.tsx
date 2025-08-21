import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiSettings, FiFolder, FiShield } from 'react-icons/fi';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
import PositionManagement from './PositionManagement';
import SystemSettings from './SystemSettings';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();

  const tabs = [
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'departments', label: 'Departments', icon: FiFolder },
    { id: 'positions', label: 'Positions', icon: FiShield },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                icon={<FiArrowLeft />}
              >
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <Card>
            <UserManagement />
          </Card>
        )}

        {activeTab === 'departments' && (
          <Card>
            <DepartmentManagement />
          </Card>
        )}

        {activeTab === 'positions' && (
          <Card>
            <PositionManagement />
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card>
            <SystemSettings />
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 