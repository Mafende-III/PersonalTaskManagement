import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Project, ProjectStatus } from '../../../shared/src/types'
import { projectService } from '../services/project'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { FiPlus, FiSearch, FiFolder, FiEdit, FiTrash2 } from 'react-icons/fi'

interface ProjectListProps {
  onCreateProject: () => void
  onEditProject: (project: Project) => void
  onViewProject: (project: Project) => void
}

export const ProjectList: React.FC<ProjectListProps> = ({ onCreateProject, onEditProject, onViewProject }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('')

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const fetchedProjects = await projectService.getAllProjects()
      setProjects(fetchedProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This will not delete the tasks in it.')) {
      try {
        await projectService.deleteProject(projectId)
        fetchProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === '' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <Button onClick={onCreateProject} icon={<FiPlus />}>
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            icon={<FiSearch />}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value={ProjectStatus.ACTIVE}>Active</option>
          <option value={ProjectStatus.COMPLETED}>Completed</option>
          <option value={ProjectStatus.ARCHIVED}>Archived</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FiFolder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter ? 'Try adjusting your filters' : 'Get started by creating your first project'}
          </p>
          <Button onClick={onCreateProject} icon={<FiPlus />}>
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-gray-200/50 hover:border-primary-200 transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-500">
                          {project.status === ProjectStatus.ACTIVE && 'Active'}
                          {project.status === ProjectStatus.COMPLETED && 'Completed'}
                          {project.status === ProjectStatus.ARCHIVED && 'Archived'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditProject(project)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span>{(project as any)._count?.tasks || 0} tasks</span>
                  </div>

                  <Button
                    onClick={() => onViewProject(project)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View Tasks
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}