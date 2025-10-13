import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { hr1 } from '@/api/hr1'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { 
  Award, 
  Star, 
  Trophy, 
  Medal, 
  Crown, 
  Target,
  TrendingUp,
  Calendar,
  User,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

const api = hr1.backend.api

export default function Hr1Recognition() {
  const [employees, setEmployees] = useState([])
  const [awards, setAwards] = useState([])
  const [badges, setBadges] = useState([])
  const [ownerNotes, setOwnerNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAwardDialog, setShowAwardDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  
  const [newAward, setNewAward] = useState({
    employee_id: '',
    award_type: '',
    reason: '',
    points: 0
  })
  
  const [newNote, setNewNote] = useState({
    employee_id: '',
    note_type: '',
    message: '',
    improvement_areas: '',
    action_plan: ''
  })

  // Award types with criteria based on HR3 attendance data
  const awardTypes = [
    { id: 'perfect_attendance', name: 'Perfect Attendance', icon: Calendar, color: 'text-green-600', points: 100, criteria: 'attendance_rate >= 100' },
    { id: 'excellent_attendance', name: 'Excellent Attendance', icon: CheckCircle, color: 'text-blue-600', points: 75, criteria: 'attendance_rate >= 95' },
    { id: 'punctuality_champion', name: 'Punctuality Champion', icon: Clock, color: 'text-purple-600', points: 80, criteria: 'punctuality_score >= 95' },
    { id: 'shift_compliance', name: 'Shift Compliance Star', icon: Star, color: 'text-yellow-600', points: 70, criteria: 'shift_compliance >= 90' },
    { id: 'top_performer', name: 'Top Performer', icon: Trophy, color: 'text-gold-600', points: 150, criteria: 'overall_score >= 90' },
    { id: 'most_improved', name: 'Most Improved', icon: TrendingUp, color: 'text-orange-600', points: 90, criteria: 'improvement_trend > 0' }
  ]

  // HR3 Integration Functions - Ready to connect to HR3 API
  const fetchHR3AttendanceData = async (employeeId) => {
    try {
      // TODO: Replace with actual HR3 API endpoint when available
      // const response = await axios.get(`http://localhost:8093/api/attendance/employee/${employeeId}`)
      // return response.data
      
      // Return empty data until HR3 API is connected
      return {
        attendance_rate: 0,
        punctuality_score: 0,
        shift_compliance: 0,
        improvement_trend: 0
      }
    } catch (error) {
      console.error("Error fetching HR3 attendance data:", error)
      return {
        attendance_rate: 0,
        punctuality_score: 0,
        shift_compliance: 0,
        improvement_trend: 0
      }
    }
  }

  const fetchAllEmployeesHR3Data = async (employeeIds) => {
    try {
      // TODO: Replace with batch HR3 API call when available
      // const response = await axios.post('http://localhost:8093/api/attendance/batch', { employee_ids: employeeIds })
      // return response.data
      
      // Mock batch processing for now
      const results = {}
      for (const employeeId of employeeIds) {
        results[employeeId] = await fetchHR3AttendanceData(employeeId)
      }
      return results
    } catch (error) {
      console.error("Error fetching batch HR3 data:", error)
      return {}
    }
  }

  // Evaluate award criteria
  const evaluateCriteria = (employee, criteria) => {
    try {
      // Replace variables in criteria string with actual values
      const expression = criteria
        .replace(/attendance_rate/g, employee.attendance_rate)
        .replace(/punctuality_score/g, employee.punctuality_score)
        .replace(/shift_compliance/g, employee.shift_compliance)
        .replace(/overall_score/g, employee.overall_score)
        .replace(/improvement_trend/g, employee.improvement_trend)
      
      return eval(expression)
    } catch (error) {
      console.error('Error evaluating criteria:', error)
      return false
    }
  }

  // Auto-assign awards based on HR3 attendance criteria
  const autoAssignAwards = useCallback((employeeList) => {
    const newAwards = []
    const newBadges = []
    
    employeeList.forEach(employee => {
      awardTypes.forEach(awardType => {
        const meetsAward = evaluateCriteria(employee, awardType.criteria)
        if (meetsAward) {
          newAwards.push({
            id: Date.now() + Math.random(),
            employee_id: employee.id,
            employee_name: employee.name,
            award_type: awardType.id,
            award_name: awardType.name,
            reason: `Automatically awarded for ${awardType.name.toLowerCase()}`,
            points: awardType.points,
            date_awarded: new Date().toISOString().split('T')[0],
            awarded_by: 'System (HR3 Integration)'
          })
          
          newBadges.push({
            id: Date.now() + Math.random(),
            employee_id: employee.id,
            badge_type: awardType.id,
            badge_name: awardType.name,
            earned_date: new Date().toISOString().split('T')[0]
          })
        }
      })
    })
    
    if (newAwards.length > 0) {
      setAwards(prev => [...prev, ...newAwards])
      setBadges(prev => [...prev, ...newBadges])
      toast.success(`${newAwards.length} new awards and ${newBadges.length} badges automatically assigned!`, { position: "top-center" })
    }
  }, [])

  // Fetch employees with HR3 attendance data
  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(api.applicants)
      const data = response.data
      const hiredEmployees = Array.isArray(data) ? data.filter(applicant => 
        applicant.status === 'hired'
      ) : []

      // Fetch HR3 performance metrics for all hired employees
      const employeeIds = hiredEmployees.map(emp => emp.id)
      const hr3Metrics = await fetchAllEmployeesHR3Data(employeeIds)

      const employeesWithMetrics = hiredEmployees.map(applicant => {
        const metrics = hr3Metrics[applicant.id] || {
          attendance_rate: 0,
          punctuality_score: 0,
          shift_compliance: 0,
          improvement_trend: 0
        }

        // Calculate overall score
        const overall_score = Math.round(
          (metrics.attendance_rate + metrics.punctuality_score + metrics.shift_compliance) / 3
        )

        return {
          id: applicant.id,
          name: applicant.name || "",
          position: applicant.job || "",
          department: applicant.department || "",
          hire_date: applicant.hire_date || "",
          email: applicant.email || "",
          employee_code: applicant.employee_code || "",
          // HR3 attendance data - ready to connect to real API
          attendance_rate: metrics.attendance_rate,
          punctuality_score: metrics.punctuality_score,
          shift_compliance: metrics.shift_compliance,
          overall_score: overall_score,
          improvement_trend: metrics.improvement_trend
        }
      })
      
      setEmployees(employeesWithMetrics)
      // Auto-assign awards based on performance
      autoAssignAwards(employeesWithMetrics)
    } catch (error) {
      console.error("Error fetching employees:", error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }, [autoAssignAwards])

  // Create manual award
  const createAward = () => {
    if (!newAward.employee_id || !newAward.award_type || !newAward.reason) {
      toast.error("Please fill in all required fields", { position: "top-center" })
      return
    }

    const employee = employees.find(e => e.id.toString() === newAward.employee_id)
    const awardType = awardTypes.find(a => a.id === newAward.award_type)
    
    const award = {
      id: Date.now(),
      employee_id: parseInt(newAward.employee_id),
      employee_name: employee?.name || "",
      award_type: newAward.award_type,
      award_name: awardType?.name || "",
      reason: newAward.reason,
      points: newAward.points || awardType?.points || 0,
      date_awarded: new Date().toISOString().split('T')[0],
      awarded_by: 'Manual Assignment'
    }

    const badge = {
      id: Date.now() + Math.random(),
      employee_id: parseInt(newAward.employee_id),
      badge_type: newAward.award_type,
      badge_name: awardType?.name || "",
      earned_date: new Date().toISOString().split('T')[0]
    }

    setAwards(prev => [...prev, award])
    setBadges(prev => [...prev, badge])
    toast.success(`Award and badge created for ${employee?.name}`, { position: "top-center" })
    resetAwardDialog()
  }

  // Create owner note
  const createOwnerNote = () => {
    if (!newNote.employee_id || !newNote.message) {
      toast.error("Please fill in required fields", { position: "top-center" })
      return
    }

    const employee = employees.find(e => e.id.toString() === newNote.employee_id)
    
    const note = {
      id: Date.now(),
      employee_id: parseInt(newNote.employee_id),
      employee_name: employee?.name || "",
      note_type: newNote.note_type,
      message: newNote.message,
      improvement_areas: newNote.improvement_areas,
      action_plan: newNote.action_plan,
      created_date: new Date().toISOString().split('T')[0],
      created_by: 'Owner'
    }

    setOwnerNotes(prev => [...prev, note])
    toast.success(`Note created for ${employee?.name}`, { position: "top-center" })
    resetNoteDialog()
  }

  const resetAwardDialog = () => {
    setShowAwardDialog(false)
    setNewAward({ employee_id: '', award_type: '', reason: '', points: 0 })
  }

  const resetNoteDialog = () => {
    setShowNoteDialog(false)
    setNewNote({ employee_id: '', note_type: '', message: '', improvement_areas: '', action_plan: '' })
  }

  const getEmployeeAwards = (employeeId) => {
    return awards.filter(award => award.employee_id === employeeId)
  }

  const getEmployeeBadges = (employeeId) => {
    return badges.filter(badge => badge.employee_id === employeeId)
  }

  const getEmployeeNotes = (employeeId) => {
    return ownerNotes.filter(note => note.employee_id === employeeId)
  }

  const getTotalPoints = (employeeId) => {
    return awards
      .filter(award => award.employee_id === employeeId)
      .reduce((total, award) => total + award.points, 0)
  }

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Awards & Recognition</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Performance-based awards connected to HR3 attendance data</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Manual Award
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Manual Award</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select onValueChange={(value) => setNewAward(prev => ({ ...prev, employee_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select onValueChange={(value) => {
                  const awardType = awardTypes.find(a => a.id === value)
                  setNewAward(prev => ({ 
                    ...prev, 
                    award_type: value,
                    points: awardType?.points || 0
                  }))
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select award type" />
                  </SelectTrigger>
                  <SelectContent>
                    {awardTypes.map(award => (
                      <SelectItem key={award.id} value={award.id}>
                        {award.name} ({award.points} points)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Textarea
                  placeholder="Reason for award"
                  value={newAward.reason}
                  onChange={(e) => setNewAward(prev => ({ ...prev, reason: e.target.value }))}
                />
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetAwardDialog} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={createAward} className="flex-1">
                    Create Award
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Owner Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Owner Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select onValueChange={(value) => setNewNote(prev => ({ ...prev, employee_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select onValueChange={(value) => setNewNote(prev => ({ ...prev, note_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Note type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="improvement">Improvement Needed</SelectItem>
                    <SelectItem value="recognition">Recognition</SelectItem>
                    <SelectItem value="coaching">Coaching Required</SelectItem>
                    <SelectItem value="development">Development Plan</SelectItem>
                  </SelectContent>
                </Select>
                
                <Textarea
                  placeholder="Owner message/feedback"
                  value={newNote.message}
                  onChange={(e) => setNewNote(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                />
                
                <Textarea
                  placeholder="Areas for improvement (optional)"
                  value={newNote.improvement_areas}
                  onChange={(e) => setNewNote(prev => ({ ...prev, improvement_areas: e.target.value }))}
                  rows={2}
                />
                
                <Textarea
                  placeholder="Action plan (optional)"
                  value={newNote.action_plan}
                  onChange={(e) => setNewNote(prev => ({ ...prev, action_plan: e.target.value }))}
                  rows={2}
                />
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetNoteDialog} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={createOwnerNote} className="flex-1">
                    Create Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="notes">Owner Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(employee => {
              const employeeAwards = getEmployeeAwards(employee.id)
              const employeeBadges = getEmployeeBadges(employee.id)
              const employeeNotes = getEmployeeNotes(employee.id)
              const totalPoints = getTotalPoints(employee.id)
              
              return (
                <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <CardDescription>{employee.position}</CardDescription>
                      </div>
                      <Badge variant="secondary">{totalPoints} pts</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{employee.attendance_rate}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Attendance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{employee.punctuality_score}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Punctuality</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{employee.shift_compliance}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Compliance</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Awards: {employeeAwards.length}</span>
                      <span>Badges: {employeeBadges.length}</span>
                      <span>Notes: {employeeNotes.length}</span>
                    </div>
                    
                    {employeeBadges.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {employeeBadges.slice(0, 3).map(badge => {
                          const awardType = awardTypes.find(a => a.id === badge.badge_type)
                          const IconComponent = awardType?.icon || Award
                          return (
                            <Badge key={badge.id} variant="outline" className="text-xs">
                              <IconComponent className="h-3 w-3 mr-1" />
                              {awardType?.name}
                            </Badge>
                          )
                        })}
                        {employeeBadges.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{employeeBadges.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="awards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Awards</CardTitle>
              <CardDescription>Awards based on HR3 attendance performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {awards.map(award => {
                  const awardType = awardTypes.find(a => a.id === award.award_type)
                  const IconComponent = awardType?.icon || Award
                  return (
                    <div key={award.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-6 w-6 ${awardType?.color || 'text-gray-600'}`} />
                        <div>
                          <div className="font-medium">{award.employee_name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{award.award_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{award.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-400">+{award.points} pts</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{award.date_awarded}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {awardTypes.map(awardType => {
              const IconComponent = awardType.icon
              const badgeCount = badges.filter(b => b.badge_type === awardType.id).length
              return (
                <Card key={awardType.id}>
                  <CardHeader className="text-center">
                    <IconComponent className={`h-12 w-12 mx-auto ${awardType.color}`} />
                    <CardTitle className="text-lg">{awardType.name}</CardTitle>
                    <CardDescription>{awardType.points} points</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold">{badgeCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">employees earned</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Owner Notes</CardTitle>
              <CardDescription>Improvement recommendations and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ownerNotes.map(note => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{note.employee_name}</div>
                        <Badge variant={
                          note.note_type === 'improvement' ? 'destructive' :
                          note.note_type === 'recognition' ? 'default' :
                          note.note_type === 'coaching' ? 'secondary' : 'outline'
                        }>
                          {note.note_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{note.created_date}</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Message: </span>
                        {note.message}
                      </div>
                      {note.improvement_areas && (
                        <div>
                          <span className="font-medium">Areas for Improvement: </span>
                          {note.improvement_areas}
                        </div>
                      )}
                      {note.action_plan && (
                        <div>
                          <span className="font-medium">Action Plan: </span>
                          {note.action_plan}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
