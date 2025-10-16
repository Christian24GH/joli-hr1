import React, { useState, useEffect, useCallback } from 'react'
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { hr1 } from "@/api/hr1"
import { motion } from "framer-motion"
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar, 
  User, 
  BarChart3, 
  Target, 
  Award, 
  Plus,
  Edit,
  Eye
} from "lucide-react"

const api = hr1.backend.api

export default function Hr1Performance() {
  const [employees, setEmployees] = useState([])
  const [performanceReviews, setPerformanceReviews] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)
  const [reviewData, setReviewData] = useState({
    period: "",
    overallRating: "",
    goals: "",
    achievements: "",
    areasForImprovement: "",
    comments: ""
  })

  // TODO: Replace with actual HR3 API call when integrating with shift and schedule management
  // const hr3Api = "http://localhost:8093/api" // HR3 shift and schedule management endpoint
  
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
          // TODO: Fetch from HR3 - shift and schedule data
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
    setLoading(true)
    // Load reviews from localStorage
    const savedReviews = localStorage.getItem('hr1_performance_reviews')
    const reviews = savedReviews ? JSON.parse(savedReviews) : []
    setPerformanceReviews(reviews)
    setLoading(false)
  }, [])

  const createPerformanceReview = () => {
    if (!selectedEmployee || !reviewData.period || !reviewData.overallRating) {
      toast.error("Please fill in all required fields", { position: "top-center" })
      return
    }

    const newReview = {
      id: Date.now(),
      employee_id: selectedEmployee.id,
      employee_name: selectedEmployee.name,
      period: reviewData.period,
      overall_rating: parseInt(reviewData.overallRating),
      goals: reviewData.goals,
      achievements: reviewData.achievements,
      areas_for_improvement: reviewData.areasForImprovement,
      comments: reviewData.comments,
      created_at: new Date().toISOString().split('T')[0],
      reviewer: "Current User" // Replace with actual user
    }

    const updatedReviews = [...performanceReviews, newReview]
    setPerformanceReviews(updatedReviews)
    
    // Save to localStorage
    localStorage.setItem('hr1_performance_reviews', JSON.stringify(updatedReviews))
    
    toast.success(`Performance review created for ${selectedEmployee.name}`, { position: "top-center" })
    resetCreateDialog()
  }

  const resetCreateDialog = () => {
    setShowCreateDialog(false)
    setSelectedEmployee(null)
    setReviewData({
      period: "",
      overallRating: "",
      goals: "",
      achievements: "",
      areasForImprovement: "",
      comments: ""
    })
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const getPerformanceMetric = (value) => {
    if (value >= 90) return { color: "text-green-600", icon: TrendingUp }
    if (value >= 70) return { color: "text-yellow-600", icon: TrendingUp }
    return { color: "text-red-600", icon: TrendingDown }
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(search.toLowerCase()) ||
    employee.position.toLowerCase().includes(search.toLowerCase()) ||
    employee.department.toLowerCase().includes(search.toLowerCase())
  )

  const filteredReviews = performanceReviews.filter(review =>
    review.employee_name.toLowerCase().includes(search.toLowerCase()) ||
    review.period.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    fetchEmployees()
    fetchPerformanceReviews()
  }, [fetchEmployees, fetchPerformanceReviews])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Reviews</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage employee evaluations and performance metrics</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Performance Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Employee *</label>
                <Select onValueChange={(value) => {
                  const employee = employees.find(e => e.id.toString() === value)
                  setSelectedEmployee(employee)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Review Period *</label>
                <Input
                  placeholder="e.g., Q1 2024"
                  value={reviewData.period}
                  onChange={(e) => setReviewData(prev => ({ ...prev, period: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Overall Rating</label>
                <Select onValueChange={(value) => setReviewData(prev => ({ ...prev, overallRating: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="3">3 - Satisfactory</SelectItem>
                    <SelectItem value="2">2 - Needs Improvement</SelectItem>
                    <SelectItem value="1">1 - Unsatisfactory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Goals & Objectives</label>
                <Textarea
                  placeholder="List the employee's goals and objectives for this period"
                  value={reviewData.goals}
                  onChange={(e) => setReviewData(prev => ({ ...prev, goals: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Key Achievements</label>
                <Textarea
                  placeholder="Describe the employee's key achievements and accomplishments"
                  value={reviewData.achievements}
                  onChange={(e) => setReviewData(prev => ({ ...prev, achievements: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Areas for Improvement</label>
                <Textarea
                  placeholder="Identify areas where the employee can improve"
                  value={reviewData.areasForImprovement}
                  onChange={(e) => setReviewData(prev => ({ ...prev, areasForImprovement: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Comments</label>
                <Textarea
                  placeholder="Any additional feedback or comments"
                  value={reviewData.comments}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetCreateDialog} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={createPerformanceReview} 
                  disabled={!selectedEmployee || !reviewData.period || !reviewData.overallRating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search employees or reviews"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="outline" className="text-sm">
          {filteredReviews.length} Reviews
        </Badge>
      </div>

      {/* Employee Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Employee Performance Metrics
            <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-600 dark:text-blue-400">
              HR3 Integration Ready
            </Badge>
          </CardTitle>
          <CardDescription>
            Performance data from shift and schedule management (HR3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => {
              const attendanceMetric = getPerformanceMetric(employee.attendance_rate)
              const punctualityMetric = getPerformanceMetric(employee.punctuality_score)
              const complianceMetric = getPerformanceMetric(employee.shift_compliance)
              
              return (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <CardDescription>{employee.position}</CardDescription>
                      </div>
                      <User className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Attendance Rate</span>
                      <div className="flex items-center gap-2">
                        <attendanceMetric.icon className={`h-4 w-4 ${attendanceMetric.color}`} />
                        <span className={`font-medium ${attendanceMetric.color}`}>
                          {employee.attendance_rate}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Punctuality</span>
                      <div className="flex items-center gap-2">
                        <punctualityMetric.icon className={`h-4 w-4 ${punctualityMetric.color}`} />
                        <span className={`font-medium ${punctualityMetric.color}`}>
                          {employee.punctuality_score}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Shift Compliance</span>
                      <div className="flex items-center gap-2">
                        <complianceMetric.icon className={`h-4 w-4 ${complianceMetric.color}`} />
                        <span className={`font-medium ${complianceMetric.color}`}>
                          {employee.shift_compliance}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Reviews */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Performance Reviews</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Performance Reviews</h3>
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Create performance reviews to track employee progress.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{review.employee_name}</CardTitle>
                      <CardDescription>{review.period}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {getRatingStars(review.overall_rating)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Key Achievements</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{review.achievements}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Areas for Improvement</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{review.areas_for_improvement}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    <span>Reviewed by {review.reviewer}</span>
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReview(review)
                      setShowViewDialog(true)
                    }}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Review Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Performance Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee</label>
                  <p className="text-sm">{selectedReview.employee_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Review Period</label>
                  <p className="text-sm">{selectedReview.period}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {getRatingStars(selectedReview.overall_rating)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">({selectedReview.overall_rating}/5)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goals & Objectives</label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedReview.goals}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Key Achievements</label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedReview.achievements}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Areas for Improvement</label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedReview.areas_for_improvement}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comments</label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedReview.comments}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  <span>Reviewed by: {selectedReview.reviewer}</span>
                  <span>Date: {new Date(selectedReview.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
