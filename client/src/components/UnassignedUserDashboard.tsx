import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { User, AlertCircle, Plus, FileText, Clock, Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface UnassignedUserDashboardProps {
  user: {
    name: string
    email: string
    personalProjectLimit: number
    accountStatus: string
  }
  onRequestAccess: () => void
  onCreatePersonalProject: () => void
  personalProjectCount: number
}

export function UnassignedUserDashboard({ 
  user, 
  onRequestAccess, 
  onCreatePersonalProject,
  personalProjectCount 
}: UnassignedUserDashboardProps) {
  const [showLimitInfo, setShowLimitInfo] = useState(false)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
      >
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Your account is set up and ready for personal project management.
            </p>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {user.accountStatus.replace('_', ' ')}
          </Badge>
        </div>
      </motion.div>

      {/* Account Status Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-800">Account Status: Unassigned</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-amber-700">
                You can create and manage personal projects. To access team features and collaborate 
                with others, request access to a department.
              </p>
              <Button 
                onClick={onRequestAccess}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Request Department Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Personal Projects Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Personal Projects
              </CardTitle>
              <Badge variant="secondary">
                {personalProjectCount} / {user.personalProjectLimit}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Create personal projects to organize your individual tasks and goals.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available slots:</span>
                  <span className="font-medium">
                    {user.personalProjectLimit - personalProjectCount} remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(personalProjectCount / user.personalProjectLimit) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <Button 
                onClick={onCreatePersonalProject}
                disabled={personalProjectCount >= user.personalProjectLimit}
                className="w-full"
                variant={personalProjectCount >= user.personalProjectLimit ? "outline" : "default"}
              >
                <Plus className="h-4 w-4 mr-2" />
                {personalProjectCount >= user.personalProjectLimit 
                  ? 'Project Limit Reached'
                  : 'Create Personal Project'
                }
              </Button>

              {personalProjectCount >= user.personalProjectLimit && (
                <p className="text-xs text-gray-500 text-center">
                  Delete existing projects or request a limit increase
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Limited Features Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Personal project creation</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Task management</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Comments & attachments</span>
                </div>
              </div>

              <hr className="my-3" />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Unlock with team access:</p>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm">Team project collaboration</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm">Department resources</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm">Advanced permissions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}