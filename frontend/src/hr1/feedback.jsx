import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { hr1 } from '@/api/hr1'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare,
  Calendar,
  Target,
  Award,
  BookOpen,
  Clock
} from 'lucide-react'
// import { toast } from 'react-hot-toast'

const api = hr1.backend.api

const Hr1Feedback = () => {
  const [employees, setEmployees] = useState([])
  const [performanceReviews, setPerformanceReviews] = useState([])
  const [feedbackData, setFeedbackData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [newFeedback, setNewFeedback] = useState({
    employee_id: '',
    feedback_type: '',
    message: '',
    action_plan: '',
    priority: 'medium'
  })
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

  // Fetch employees and performance data
  const fetchEmployees = useCallback(() => {
    // Fetch actual employee data from HR1 applicants API
    axios
      .get(api.applicants)
      .then((response) => {
        const data = response.data
        // Filter only hired employees
        const hiredEmployees = Array.isArray(data) ? data.filter(applicant => 
          applicant.status === 'hired'
        ).map(applicant => ({
          id: applicant.id,
          name: applicant.name || "",
          position: applicant.job || "",
          department: applicant.department || "",
          hire_date: applicant.hire_date || "",
          email: applicant.email || "",
          employee_code: applicant.employee_code || "",
          phone: applicant.phone || "",
          attendance_rate: 0,
          punctuality_score: 0,
          shift_compliance: 0
        })) : []
        setEmployees(hiredEmployees)
      })
      .catch((error) => {
        console.error("Error fetching employees:", error)
        setEmployees([])
      })
  }, [])

  const fetchPerformanceReviews = useCallback(() => {
    // Mock performance review data
    const mockReviews = []
    setPerformanceReviews(mockReviews)
  }, [])

  const fetchFeedbackData = useCallback(() => {
    // Mock feedback data
    const mockFeedback = []
    setFeedbackData(mockFeedback)
    setLoading(false)
  }, [])

  // Analyze performance and determine feedback type
  const analyzePerformance = (employee) => {
    const review = performanceReviews.find(r => r.employee_id === employee.id)
    
    // Performance thresholds
    const attendanceThreshold = 85
    const punctualityThreshold = 80
    const complianceThreshold = 85
    const ratingThreshold = 3

    const needsCoaching = 
      employee.attendance_rate < attendanceThreshold ||
      employee.punctuality_score < punctualityThreshold ||
      employee.shift_compliance < complianceThreshold ||
      (review && review.overall_rating < ratingThreshold)

    return {
      needsCoaching,
      performanceScore: Math.round((employee.attendance_rate + employee.punctuality_score + employee.shift_compliance) / 3),
      overallRating: review ? review.overall_rating : 0,
      areas: {
        attendance: employee.attendance_rate < attendanceThreshold,
        punctuality: employee.punctuality_score < punctualityThreshold,
        compliance: employee.shift_compliance < complianceThreshold,
        rating: review && review.overall_rating < ratingThreshold
      }
    }
  }

  const createFeedback = () => {
    if (!newFeedback.employee_id || !newFeedback.feedback_type || !newFeedback.message) {
      alert("Please fill in all required fields")
      return
    }

    const feedback = {
      id: feedbackData.length + 1,
      ...newFeedback,
      employee_name: employees.find(e => e.id === parseInt(newFeedback.employee_id))?.name || "",
      status: "pending",
      created_at: new Date().toISOString().split('T')[0],
      created_by: ""
    }

    setFeedbackData([...feedbackData, feedback])
    setNewFeedback({
      employee_id: '',
      feedback_type: '',
      message: '',
      action_plan: '',
      priority: 'medium'
    })
    setShowFeedbackDialog(false)
    alert("Feedback created successfully")
  }

  const updateFeedbackStatus = (feedbackId, status) => {
    setFeedbackData(prev => 
      prev.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, status }
          : feedback
      )
    )
    alert(`Feedback marked as ${status}`)
  }

  useEffect(() => {
    fetchEmployees()
    fetchPerformanceReviews()
    fetchFeedbackData()
  }, [fetchEmployees, fetchPerformanceReviews, fetchFeedbackData])

  const getPerformanceStats = () => {
    const employeesNeedingCoaching = employees.filter(emp => analyzePerformance(emp).needsCoaching).length
    const employeesPerformingWell = employees.length - employeesNeedingCoaching
    const pendingFeedback = feedbackData.filter(f => f.status === 'pending').length
    
    return {
      employeesNeedingCoaching,
      employeesPerformingWell,
      pendingFeedback,
      totalEmployees: employees.length
    }
  }

  const stats = getPerformanceStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading feedback data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Feedback</h1>
          <p className="text-gray-600 dark:text-gray-300">Performance-based feedback and coaching recommendations</p>
        </div>
        <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Create Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Employee Feedback</DialogTitle>
              <DialogDescription>
                Provide feedback based on performance analysis
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select value={newFeedback.employee_id} onValueChange={(value) => setNewFeedback({...newFeedback, employee_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name || `Employee ${employee.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="feedback_type">Feedback Type</Label>
                <Select value={newFeedback.feedback_type} onValueChange={(value) => setNewFeedback({...newFeedback, feedback_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coaching_needed">Coaching Needed</SelectItem>
                    <SelectItem value="performing_well">Performing Well</SelectItem>
                    <SelectItem value="improvement_plan">Improvement Plan</SelectItem>
                    <SelectItem value="recognition">Recognition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newFeedback.priority} onValueChange={(value) => setNewFeedback({...newFeedback, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Feedback Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter feedback message..."
                  value={newFeedback.message}
                  onChange={(e) => setNewFeedback({...newFeedback, message: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="action_plan">Action Plan</Label>
                <Textarea
                  id="action_plan"
                  placeholder="Enter action plan..."
                  value={newFeedback.action_plan}
                  onChange={(e) => setNewFeedback({...newFeedback, action_plan: e.target.value})}
                />
              </div>
              <Button onClick={createFeedback} className="w-full">
                Create Feedback
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Coaching</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.employeesNeedingCoaching}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Employees requiring attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performing Well</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.employeesPerformingWell}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Employees meeting standards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.pendingFeedback}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Under review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Management</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Performance Analysis</CardTitle>
              <CardDescription>
                Automated analysis based on performance metrics and reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map(employee => {
                  const analysis = analyzePerformance(employee)
                  return (
                    <div key={employee.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{employee.name || `Employee ${employee.id}`}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{employee.position || "Position not specified"}</p>
                        </div>
                        <Badge variant={analysis.needsCoaching ? "destructive" : "default"}>
                          {analysis.needsCoaching ? "Needs Coaching" : "Performing Well"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Attendance</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={employee.attendance_rate} className="flex-1" />
                            <span className="text-sm">{employee.attendance_rate}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Punctuality</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={employee.punctuality_score} className="flex-1" />
                            <span className="text-sm">{employee.punctuality_score}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Compliance</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={employee.shift_compliance} className="flex-1" />
                            <span className="text-sm">{employee.shift_compliance}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Overall Score</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={analysis.performanceScore} className="flex-1" />
                            <span className="text-sm">{analysis.performanceScore}%</span>
                          </div>
                        </div>
                      </div>

                      {analysis.needsCoaching && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Areas needing attention: {Object.entries(analysis.areas)
                              .filter(([_, needs]) => needs)
                              .map(([area, _]) => area)
                              .join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Management</CardTitle>
              <CardDescription>
                Track and manage employee feedback and coaching sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackData.map(feedback => (
                  <div key={feedback.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{feedback.employee_name || `Employee ${feedback.employee_id}`}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {feedback.feedback_type.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={
                          feedback.priority === 'high' ? 'destructive' : 
                          feedback.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {feedback.priority}
                        </Badge>
                        <Badge variant={feedback.status === 'pending' ? 'outline' : 'default'}>
                          {feedback.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div>
                        <p className="text-sm font-medium">Feedback:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{feedback.message || "No message provided"}</p>
                      </div>
                      {feedback.action_plan && (
                        <div>
                          <p className="text-sm font-medium">Action Plan:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{feedback.action_plan}</p>
                        </div>
                      )}
                    </div>

                    {feedback.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateFeedbackStatus(feedback.id, 'in_progress')}
                        >
                          Start Action
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => updateFeedbackStatus(feedback.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Hr1Feedback
