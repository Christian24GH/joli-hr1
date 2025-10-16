import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { hr1 } from "@/api/hr1"
import { motion } from "framer-motion"
import { Calendar, Clock, User, Phone, Mail, Plus, Edit, Trash2, CheckCircle, XCircle, MapPin, Check } from "lucide-react"
import { ConfirmationModal, useConfirmation } from "@/components/ui/confirmation-modal"

const api = hr1.backend.api

export default function Hr1InterviewPage() {
  const [interviews, setInterviews] = useState([])
  const [applicants, setApplicants] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewTime, setInterviewTime] = useState("")
  const [interviewType, setInterviewType] = useState("")
  const [interviewAddress, setInterviewAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showPendingDialog, setShowPendingDialog] = useState(false)
  const [pendingInterview, setPendingInterview] = useState(null)
  
  // Confirmation modals
  const deleteConfirmation = useConfirmation()
  const approveConfirmation = useConfirmation()
  const rejectConfirmation = useConfirmation()
  const markDoneConfirmation = useConfirmation()

  // Check if interview date has passed
  const isInterviewPast = (interviewDate) => {
    if (!interviewDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const schedDate = new Date(interviewDate)
    schedDate.setHours(0, 0, 0, 0)
    return schedDate < today
  }

  const fetchInterviews = useCallback(() => {
    setLoading(true)
    axios
      .get(api.interviews, { params: { q: search || undefined } })
      .then((response) => {
        const data = response.data
        console.log("Fetched interviews:", data)
        
        // Process interviews and check for past dates or completed without result
        const processedInterviews = Array.isArray(data) ? data.map(interview => {
          // If interview is scheduled but date has passed, mark as pending
          if (interview.status === 'scheduled' && isInterviewPast(interview.date)) {
            return { ...interview, status: 'pending' }
          }
          // If interview is completed but has no result (approved/rejected), mark as pending
          if (interview.status === 'completed' && !interview.result) {
            return { ...interview, status: 'pending' }
          }
          return interview
        }) : []
        
        setInterviews(processedInterviews)
      })
      .catch((error) => {
        console.error("Error fetching interviews:", error)
        toast.error("Error fetching interviews", { position: "top-center" })
      })
      .finally(() => setLoading(false))
  }, [search])

  const fetchApplicants = useCallback(() => {
    axios
      .get(api.applicants)
      .then((response) => {
        const data = response.data
        setApplicants(Array.isArray(data) ? data : [])
      })
      .catch(() =>
        toast.error("Error fetching applicants", { position: "top-center" })
      )
  }, [])

  const scheduleInterview = async () => {
    if (!selectedApplicant || !interviewDate || !interviewTime) {
      toast.error("Please fill in all required fields", { position: "top-center" })
      return
    }

    // Validate address for in-person interviews
    if (interviewType === 'In-person' && !interviewAddress) {
      toast.error("Please provide an address for in-person interview", { position: "top-center" })
      return
    }

    try {
      // Build interview data based on type
      let interviewData = {}
      
      if (interviewType === 'In-person') {
        // For in-person: only send date, time, and address
        interviewData = {
          applicant_id: selectedApplicant.id,
          date: interviewDate,
          time: interviewTime,
          address: interviewAddress,
          type: 'In-person',
          status: 'scheduled'
        }
      } else {
        // For video/phone: send date, time, and notes
        interviewData = {
          applicant_id: selectedApplicant.id,
          date: interviewDate,
          time: interviewTime,
          type: interviewType,
          notes: notes,
          status: 'scheduled'
        }
      }

      console.log("Selected applicant:", selectedApplicant)
      console.log("Interview data being sent:", interviewData)

      const response = await axios.post(api.interviews, interviewData)
      console.log("Interview creation response:", response.data)
      
      // Update applicant status to 'interviewed' when interview is scheduled
      await axios.put(`${api.applicants}/${selectedApplicant.id}`, {
        ...selectedApplicant,
        status: 'interviewed'
      })
      
      toast.success("Interview scheduled successfully", { position: "top-center" })
      setShowScheduleDialog(false)
      resetForm()
      
      // Refresh data
      await fetchInterviews()
      await fetchApplicants()
    } catch (error) {
      console.error("Interview scheduling error:", error.response?.data || error.message)
      toast.error(`Failed to schedule interview: ${error.response?.data?.error || error.message}`, { position: "top-center" })
    }
  }

  const resetForm = () => {
    setSelectedApplicant(null)
    setInterviewDate("")
    setInterviewTime("")
    setInterviewType("")
    setInterviewAddress("")
    setNotes("")
  }

  const formatTime = (time) => {
    if (!time) return 'Time not set'
    
    // If time is already in 12-hour format (contains AM/PM), return as is
    if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
      return time
    }
    
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const deleteInterview = async (id) => {
    try {
      await axios.delete(api.deleteInterview(id))
      toast.success("Interview deleted successfully", { position: "top-center" })
      fetchInterviews()
    } catch (error) {
      toast.error("Failed to delete interview", { position: "top-center" })
    }
  }

  const markAsDone = async (interviewId) => {
    try {
      const interview = interviews.find(i => i.id === interviewId)
      const applicant = applicants.find(a => a.id === interview.applicant_id)
      
      console.log("Marking interview as done:", { interviewId, interview, applicant })
      
      // Update interview status to completed without result
      const interviewUpdateData = {
        applicant_id: interview.applicant_id,
        date: interview.date,
        time: interview.time || null,
        type: interview.type || null,
        address: interview.address || null,
        notes: interview.notes || null,
        status: 'completed',
        completed_date: new Date().toISOString().split('T')[0]
      }
      
      console.log("Interview update data:", interviewUpdateData)
      await axios.put(`${api.interviews}/${interviewId}`, interviewUpdateData)

      toast.success(`Interview marked as done. You can approve or reject it later.`, { position: "top-center" })
      
      fetchInterviews()
    } catch (error) {
      console.error("Mark as done error:", error.response?.data || error.message)
      
      if (error.response?.data?.errors) {
        console.error("Validation errors:", error.response.data.errors)
        const errorMsg = Object.entries(error.response.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('; ')
        toast.error(`Validation failed: ${errorMsg}`, { position: "top-center", duration: 8000 })
      } else {
        toast.error(`Failed to mark as done: ${error.response?.data?.error || error.message}`, { position: "top-center" })
      }
    }
  }

  const updatePendingToCompleted = async (interviewId) => {
    try {
      const interview = interviews.find(i => i.id === interviewId)
      
      // Update interview status from pending to completed
      const interviewUpdateData = {
        applicant_id: interview.applicant_id,
        date: interview.date,
        time: interview.time || null,
        type: interview.type || null,
        address: interview.address || null,
        notes: interview.notes || null,
        status: 'completed',
        completed_date: new Date().toISOString().split('T')[0]
      }
      
      await axios.put(`${api.interviews}/${interviewId}`, interviewUpdateData)
      toast.success(`Interview marked as completed.`, { position: "top-center" })
      setShowPendingDialog(false)
      setPendingInterview(null)
      fetchInterviews()
    } catch (error) {
      console.error("Update pending error:", error.response?.data || error.message)
      toast.error(`Failed to update interview`, { position: "top-center" })
    }
  }

  const completeInterview = async (interviewId, result) => {
    try {
      const interview = interviews.find(i => i.id === interviewId)
      const applicant = applicants.find(a => a.id === interview.applicant_id)
      
      console.log("Completing interview:", { interviewId, result, interview, applicant })
      
      // Update interview status
      const interviewUpdateData = {
        applicant_id: interview.applicant_id,
        date: interview.date,
        time: interview.time || null,
        type: interview.type || null,
        address: interview.address || null,
        notes: interview.notes || null,
        status: 'completed',
        result: result,
        completed_date: new Date().toISOString().split('T')[0]
      }
      
      console.log("Interview update data:", interviewUpdateData)
      await axios.put(`${api.interviews}/${interviewId}`, interviewUpdateData)

      // Update applicant status based on interview result
      if (applicant) {
        const newStatus = result === 'approved' ? 'approved' : 'rejected'
        console.log("Updating applicant status to:", newStatus)
        await axios.put(`${api.applicants}/${applicant.id}`, {
          ...applicant,
          status: newStatus
        })
      }

      if (result === 'approved') {
        toast.success(`Interview approved! ${applicant.name} has been moved to onboarding checklist`, { position: "top-center" })
      } else {
        toast.success(`Interview ${result} successfully`, { position: "top-center" })
      }
      
      fetchInterviews()
    } catch (error) {
      console.error("Complete interview error:", error.response?.data || error.message)
      
      if (error.response?.data?.errors) {
        console.error("Validation errors:", error.response.data.errors)
        console.error("Debug data:", error.response.data.debug_data)
        const errorMsg = Object.entries(error.response.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('; ')
        toast.error(`Validation failed: ${errorMsg}`, { position: "top-center", duration: 8000 })
      } else {
        toast.error(`Failed to complete interview: ${error.response?.data?.error || error.message}`, { position: "top-center" })
      }
    }
  }

  useEffect(() => {
    fetchApplicants()
  }, [])

  useEffect(() => {
    const delay = setTimeout(fetchInterviews, 300)
    return () => clearTimeout(delay)
  }, [fetchInterviews])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interview Scheduling</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Schedule and manage interviews with applicants</p>
        </div>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Applicant</label>
                <Select onValueChange={(value) => {
                  const applicant = applicants.find(a => a.id.toString() === value)
                  setSelectedApplicant(applicant)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an applicant" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicants.map((applicant) => (
                      <SelectItem key={applicant.id} value={applicant.id.toString()}>
                        {applicant.name} - {applicant.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Interview Date</label>
                <Input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Interview Time</label>
                <Input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Interview Type</label>
                <Select onValueChange={(value) => {
                  setInterviewType(value)
                  // Auto-fill address for in-person interviews
                  if (value === 'In-person') {
                    setInterviewAddress('Ph.4, North Olympus Subdivision, Mendelssohn, Novaliches, Quezon City, 1124 Metro Manila')
                  } else {
                    setInterviewAddress('')
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-person">In-person</SelectItem>
                    <SelectItem value="Video Call">Video Call</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {interviewType === 'In-person' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Address <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="Enter interview location address"
                    value={interviewAddress}
                    onChange={(e) => setInterviewAddress(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <Input
                    placeholder="Meeting link or additional instructions"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={scheduleInterview} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Search interviews by applicant name or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Badge variant="outline" className="text-sm">
            {interviews.filter(i => statusFilter === "all" || 
              (statusFilter === "scheduled" && i.status === "scheduled") ||
              (statusFilter === "approved" && i.result === "approved") ||
              (statusFilter === "rejected" && i.result === "rejected")
            ).length} {interviews.length === 1 ? 'Interview' : 'Interviews'}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className={statusFilter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "scheduled" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("scheduled")}
            className={statusFilter === "scheduled" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            Scheduled
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
            className={statusFilter === "pending" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("approved")}
            className={statusFilter === "approved" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("rejected")}
            className={statusFilter === "rejected" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            Rejected
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      ) : interviews.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Scheduled</h3>
            <p className="text-gray-500">Start by scheduling your first interview with an applicant.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {interviews
            .filter(interview => {
              if (statusFilter === "all") return true
              if (statusFilter === "scheduled") return interview.status === "scheduled"
              if (statusFilter === "pending") return interview.status === "pending"
              if (statusFilter === "approved") return interview.result === "approved"
              if (statusFilter === "rejected") return interview.result === "rejected"
              return true
            })
            .map((interview) => {
            const applicant = applicants.find(a => a.id === interview.applicant_id) || {}
            return (
              <Card key={interview.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {applicant.name || interview.applicant || 'Unknown Applicant'}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        {applicant.job_title || 'Position not specified'}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={
                          interview.status === 'scheduled' ? 'default' : 
                          interview.status === 'pending' ? 'default' :
                          interview.status === 'completed' ? 'secondary' : 
                          'destructive'
                        }
                        className={
                          interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          interview.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {interview.status === 'pending' ? 'Pending' : interview.status || 'Scheduled'}
                      </Badge>
                      {interview.status === 'completed' && interview.result && (
                        <Badge 
                          variant={interview.result === 'approved' ? 'default' : 'destructive'}
                          className={
                            interview.result === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }
                        >
                          {interview.result === 'approved' ? 'Approved' : 'Rejected'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="py-3 space-y-2">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-blue-500 dark:text-blue-400" />
                      <span className="font-medium">
                        {interview.date ? new Date(interview.date).toLocaleDateString() : 'Date not set'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                      <Clock className="h-3.5 w-3.5 mr-2 text-blue-500 dark:text-blue-400" />
                      <span className="font-medium">
                        {formatTime(interview.time)}
                      </span>
                    </div>
                    
                    {applicant.email && (
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                        <Mail className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="truncate">{applicant.email}</span>
                      </div>
                    )}
                    
                    {applicant.phone && (
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                        <Phone className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                        {applicant.phone}
                      </div>
                    )}
                    
                    {interview.type && (
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                        <User className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                        {interview.type}
                      </div>
                    )}
                    
                    {interview.type === 'In-person' && interview.address && (
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                        <MapPin className="h-3.5 w-3.5 mr-2 text-blue-500 dark:text-blue-400" />
                        <span className="font-medium">{interview.address}</span>
                      </div>
                    )}
                  </div>
                  
                  {interview.notes && interview.type !== 'In-person' && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg mt-2 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Notes: </span>
                        {interview.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-2 pb-3">
                  {interview.status === 'pending' ? (
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        onClick={() => approveConfirmation.confirm(() => completeInterview(interview.id, 'approved'))}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        onClick={() => rejectConfirmation.confirm(() => completeInterview(interview.id, 'rejected'))}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteConfirmation.confirm(() => deleteInterview(interview.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : interview.status === 'scheduled' ? (
                    <div className="flex flex-col gap-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        onClick={() => markDoneConfirmation.confirm(() => markAsDone(interview.id))}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark as Done
                      </Button>
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          onClick={() => approveConfirmation.confirm(() => completeInterview(interview.id, 'approved'))}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          onClick={() => rejectConfirmation.confirm(() => completeInterview(interview.id, 'rejected'))}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deleteConfirmation.confirm(() => deleteInterview(interview.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : interview.status === 'completed' && !interview.result ? (
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        onClick={() => approveConfirmation.confirm(() => completeInterview(interview.id, 'approved'))}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        onClick={() => rejectConfirmation.confirm(() => completeInterview(interview.id, 'rejected'))}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteConfirmation.confirm(() => deleteInterview(interview.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          toast.info(`Editing interview for ${applicant.name}`, { position: "top-center" })
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => deleteConfirmation.confirm(() => deleteInterview(interview.id))}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setIsOpen}
        onConfirm={deleteConfirmation.onConfirm}
        title="Delete Interview"
        description="Are you sure you want to delete this interview? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmationModal
        open={approveConfirmation.isOpen}
        onOpenChange={approveConfirmation.setIsOpen}
        onConfirm={approveConfirmation.onConfirm}
        title="Approve Interview"
        description="Are you sure you want to approve this interview? The applicant will be moved to the onboarding checklist."
        confirmText="Approve"
      />

      <ConfirmationModal
        open={rejectConfirmation.isOpen}
        onOpenChange={rejectConfirmation.setIsOpen}
        onConfirm={rejectConfirmation.onConfirm}
        title="Reject Interview"
        description="Are you sure you want to reject this interview? This will update the applicant's status."
        confirmText="Reject"
        variant="destructive"
      />

      <ConfirmationModal
        open={markDoneConfirmation.isOpen}
        onOpenChange={markDoneConfirmation.setIsOpen}
        onConfirm={markDoneConfirmation.onConfirm}
        title="Mark Interview as Done"
        description="Mark this interview as completed? You can approve or reject it later."
        confirmText="Mark as Done"
      />
    </motion.div>
  )
}
