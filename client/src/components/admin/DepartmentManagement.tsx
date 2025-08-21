import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface Department {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data.departments.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          description: dept.description,
          userCount: dept._count.users
        })));
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(newDepartment),
      });
      
      if (response.ok) {
        setNewDepartment({ name: '', description: '' });
        fetchDepartments();
      }
    } catch (error) {
      console.error('Failed to create department:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    try {
      const response = await fetch(`/api/admin/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(editingDepartment),
      });
      
      if (response.ok) {
        setEditingDepartment(null);
        fetchDepartments();
      }
    } catch (error) {
      console.error('Failed to update department:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await fetch(`/api/admin/departments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        fetchDepartments();
      }
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  if (loading) {
    return <div>Loading departments...</div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Department Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingDepartment ? 'Edit Department' : 'Create New Department'}
          </h3>
          <form onSubmit={editingDepartment ? handleUpdate : handleSubmit}>
            <div className="space-y-4">
              <Input
                placeholder="Department Name"
                value={editingDepartment ? editingDepartment.name : newDepartment.name}
                onChange={(e) => editingDepartment 
                  ? setEditingDepartment({ ...editingDepartment, name: e.target.value })
                  : setNewDepartment({ ...newDepartment, name: e.target.value })
                }
                required
              />
              <Input
                placeholder="Description"
                value={editingDepartment ? editingDepartment.description : newDepartment.description}
                onChange={(e) => editingDepartment
                  ? setEditingDepartment({ ...editingDepartment, description: e.target.value })
                  : setNewDepartment({ ...newDepartment, description: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Button type="submit">
                  {editingDepartment ? 'Update' : 'Create'}
                </Button>
                {editingDepartment && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingDepartment(null)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>

        {/* Departments List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Departments</h3>
          <div className="space-y-4">
            {departments.map((department) => (
              <div
                key={department.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{department.name}</h4>
                  <p className="text-sm text-gray-600">{department.description}</p>
                  <span className="text-xs text-gray-500">
                    {department.userCount} users
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingDepartment(department)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(department.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <p className="text-gray-500 text-center">No departments found</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DepartmentManagement; 