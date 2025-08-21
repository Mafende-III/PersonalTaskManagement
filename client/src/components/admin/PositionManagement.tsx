import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';

interface Position {
  id: string;
  name: string;
  level: number;
  departmentId: string;
  permissions: {
    project: {
      create: boolean;
      delete: 'own' | 'department' | 'all' | false;
      edit: 'own' | 'assigned' | 'department' | 'all' | false;
      view: 'own' | 'assigned' | 'department' | 'all' | false;
      assignUsers: boolean;
    };
    task: {
      create: 'standalone' | 'assigned_project' | 'any_project' | false;
      delete: 'own' | 'assigned' | 'department' | 'all' | false;
      edit: 'own' | 'assigned' | 'department' | 'all' | false;
      createSubtask: 'own' | 'assigned' | false;
    };
    user: {
      invite: boolean;
      edit: 'subordinate' | 'department' | 'all' | false;
      viewDetails: 'subordinate' | 'department' | 'all' | false;
    };
    department: {
      manage: boolean;
      editHierarchy: boolean;
    };
  };
}

interface Department {
  id: string;
  name: string;
}

const defaultPermissions = {
  project: {
    create: false,
    delete: false as const,
    edit: false as const,
    view: 'own' as const,
    assignUsers: false
  },
  task: {
    create: false as const,
    delete: 'own' as const,
    edit: 'own' as const,
    createSubtask: 'own' as const
  },
  user: {
    invite: false,
    edit: false as const,
    viewDetails: 'subordinate' as const
  },
  department: {
    manage: false,
    editHierarchy: false
  }
};

const PositionManagement: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPosition, setNewPosition] = useState({
    name: '',
    level: 1,
    departmentId: '',
    permissions: defaultPermissions
  });
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const authHeaders = {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      };
      
      const [positionsRes, departmentsRes] = await Promise.all([
        fetch('/api/admin/positions', { headers: authHeaders }),
        fetch('/api/admin/departments', { headers: authHeaders })
      ]);
      
      const positionsData = await positionsRes.json();
      const departmentsData = await departmentsRes.json();
      
      if (positionsData.success) {
        setPositions(positionsData.data.positions);
      }
      if (departmentsData.success) {
        setDepartments(departmentsData.data.departments);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(newPosition),
      });
      
      if (response.ok) {
        setNewPosition({
          name: '',
          level: 1,
          departmentId: '',
          permissions: defaultPermissions
        });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create position:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosition) return;

    try {
      const response = await fetch(`/api/admin/positions/${editingPosition.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(editingPosition),
      });
      
      if (response.ok) {
        setEditingPosition(null);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this position?')) return;

    try {
      const response = await fetch(`/api/admin/positions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete position:', error);
    }
  };

  if (loading) {
    return <div>Loading positions...</div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Position Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingPosition ? 'Edit Position' : 'Create New Position'}
          </h3>
          <form onSubmit={editingPosition ? handleUpdate : handleSubmit}>
            <div className="space-y-4">
              <Input
                placeholder="Position Name"
                value={editingPosition ? editingPosition.name : newPosition.name}
                onChange={(e) => editingPosition 
                  ? setEditingPosition({ ...editingPosition, name: e.target.value })
                  : setNewPosition({ ...newPosition, name: e.target.value })
                }
                required
              />
              
              <Select
                value={editingPosition ? editingPosition.departmentId : newPosition.departmentId}
                onChange={(e) => editingPosition
                  ? setEditingPosition({ ...editingPosition, departmentId: e.target.value })
                  : setNewPosition({ ...newPosition, departmentId: e.target.value })
                }
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>

              <Input
                type="number"
                min="1"
                placeholder="Hierarchy Level (1 = highest)"
                value={editingPosition ? editingPosition.level : newPosition.level}
                onChange={(e) => editingPosition
                  ? setEditingPosition({ ...editingPosition, level: parseInt(e.target.value) })
                  : setNewPosition({ ...newPosition, level: parseInt(e.target.value) })
                }
                required
              />

              <div className="flex gap-2">
                <Button type="submit">
                  {editingPosition ? 'Update' : 'Create'}
                </Button>
                {editingPosition && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingPosition(null)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>

        {/* Positions List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Positions</h3>
          <div className="space-y-4">
            {positions.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{position.name}</h4>
                  <p className="text-sm text-gray-600">
                    Level: {position.level}
                  </p>
                  <p className="text-xs text-gray-500">
                    Department: {departments.find(d => d.id === position.departmentId)?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPosition(position)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(position.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {positions.length === 0 && (
              <p className="text-gray-500 text-center">No positions found</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PositionManagement; 