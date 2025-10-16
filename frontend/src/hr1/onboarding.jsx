import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ConfirmationModal, useConfirmation } from "@/components/ui/confirmation-modal"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { hr1 } from "@/api/hr1"
import { motion } from "framer-motion"
import { CheckCircle, Circle, User, Calendar, Briefcase, Mail, Phone, Plus, ExternalLink, Award, Trash2 } from "lucide-react"

const api = hr1.backend.api

// New onboarding checklist items with department connections
const defaultChecklistItems = [
  { key: 'training_hr2', task: "Training", department: "HR2 - Training", required: true, auto_checkable: true },
  { key: 'offer_compensation_hr4', task: "Offer acceptance & Compensation Data entry", department: "HR4 - Payroll", required: true, auto_checkable: true },
  { key: 'schedule_hr3', task: "Get the Schedule of work", department: "HR3 - Attendance", required: true, auto_checkable: true },
  { key: 'documents_admin', task: "Archive legal documents and onboarding forms", department: "Administrative", required: true, auto_checkable: false },
  { key: 'equipment_logistics', task: "ID, Uniform, tools", department: "Logistics", required: true, auto_checkable: false }
]

export default function Hr1Onboarding() {
  const [applicants, setApplicants] = useState([])
  const [onboardingList, setOnboardingList] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  
  // Confirmation modal for checklist item toggle
  const toggleItemConfirmation = useConfirmation()

  const fetchApplicants = useCallback(() => {
    axios
      .get(api.applicants)
      .then((response) => {
        const data = response.data
        // Filter only approved applicants
        const approvedApplicants = Array.isArray(data) ? data.filter(applicant => 
          applicant.status === 'approved'
        ) : []
        setApplicants(approvedApplicants)
      })
      .catch(() =>
        toast.error("Error fetching approved applicants", { position: "top-center" })
      )
  }, [])

  const fetchOnboardingList = useCallback(() => {
    setLoading(true)
    axios
      .get(api.onboarding)
      .then((response) => {
        const data = response.data
        setOnboardingList(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching onboarding data:", error)
        setOnboardingList([])
        setLoading(false)
      })
  }, [])

  const updateApplicantStatus = async (applicantId, newStatus) => {
    try {
      await axios.put(`${api.applicants}/${applicantId}`, { status: newStatus })
      // Update local applicants state
      setApplicants(prev => prev.map(applicant => 
        applicant.id === applicantId 
          ? { ...applicant, status: newStatus }
          : applicant
      ))
    } catch (error) {
      console.error("Error updating applicant status:", error)
    }
  }

  const createOnboardingChecklist = async () => {
    if (!selectedApplicant) return

    try {
      await axios.post(api.createOnboarding, {
        applicant_id: selectedApplicant.id,
        start_date: new Date().toISOString().split('T')[0]
      })
      
      toast.success(`Onboarding checklist created for ${selectedApplicant.name}`, { position: "top-center" })
      
      // Refresh lists
      fetchOnboardingList()
      fetchApplicants()
      
      setShowCreateDialog(false)
      setSelectedApplicant(null)
    } catch (error) {
      console.error("Error creating onboarding checklist:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error message:", error.response?.data?.message)
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to create onboarding checklist"
      toast.error(errorMessage, { position: "top-center", duration: 5000 })
    }
  }

  const toggleChecklistItem = async (onboardingId, itemKey, currentStatus, taskName) => {
    try {
      await axios.put(api.updateOnboardingItem(onboardingId), {
        item_key: itemKey,
        completed: !currentStatus,
        completed_by: 'Manual'
      })
      
      // Refresh the onboarding list
      fetchOnboardingList()
      
      const action = !currentStatus ? 'completed' : 'unchecked'
      toast.success(`Task "${taskName}" ${action}`, { position: "top-center" })
    } catch (error) {
      console.error("Error updating checklist item:", error)
      toast.error("Failed to update checklist item", { position: "top-center" })
    }
  }

  const deleteOnboardingChecklist = async (onboardingId, applicantName) => {
    if (!confirm(`Are you sure you want to delete the onboarding checklist for ${applicantName}?`)) {
      return
    }

    try {
      // Note: You'll need to add a delete endpoint in the backend
      await axios.delete(`${api.onboarding}/${onboardingId}`)
      
      toast.success('Onboarding checklist deleted', { position: "top-center" })
      
      // Refresh lists
      fetchOnboardingList()
      fetchApplicants()
    } catch (error) {
      console.error("Error deleting onboarding checklist:", error)
      toast.error("Failed to delete checklist", { position: "top-center" })
    }
  }

  const getProgress = (completionPercentage) => {
    return completionPercentage || 0
  }

  const getAvailableApplicants = () => {
    const onboardingApplicantIds = onboardingList.map(o => o.applicant_id)
    return applicants.filter(applicant => !onboardingApplicantIds.includes(applicant.id))
  }

  const filteredOnboarding = onboardingList.filter(onboarding =>
    (onboarding.applicant_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (onboarding.job_title?.toLowerCase() || '').includes(search.toLowerCase())
  )

  useEffect(() => {
    fetchApplicants()
    fetchOnboardingList()
  }, [fetchApplicants, fetchOnboardingList])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Onboarding Checklist</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track onboarding progress for approved applicants</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => window.location.href = '/hr1/hired-employees'}
            variant="outline"
            className="border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50"
          >
            <Award className="h-4 w-4 mr-2" />
            View All Hired
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Onboarding
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Onboarding Checklist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Approved Applicant</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getAvailableApplicants().length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm">No approved applicants available for onboarding</p>
                  ) : (
                    getAvailableApplicants().map((applicant) => (
                      <div
                        key={applicant.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedApplicant?.id === applicant.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedApplicant(applicant)}
                      >
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{applicant.email}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{applicant.job_title}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowCreateDialog(false)
                  setSelectedApplicant(null)
                }} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedApplicant && createOnboardingChecklist(selectedApplicant)} 
                  disabled={!selectedApplicant}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Create Checklist
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by applicant name or job title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="outline" className="text-sm">
          {filteredOnboarding.length} {filteredOnboarding.length === 1 ? 'Person' : 'People'} Onboarding
        </Badge>
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
      ) : filteredOnboarding.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <User className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Onboarding in Progress</h3>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Create onboarding checklists for approved applicants to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOnboarding.map((onboarding) => {
            const progress = getProgress(onboarding.completion_percentage)
            const checklistItems = onboarding.checklist_items || []
            const completedCount = checklistItems.filter(item => item.completed).length
            
            return (
              <Card key={onboarding.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {onboarding.applicant_name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {onboarding.job_title}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={progress === 100 ? 'default' : 'secondary'}
                      className={progress === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                    >
                      {progress}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {onboarding.applicant_email}
                    </div>
                    
                    {onboarding.applicant_phone && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {onboarding.applicant_phone}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      Start Date: {new Date(onboarding.start_date).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      Required Tasks: {completedCount}/{checklistItems.length}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">Checklist Items:</h4>
                    {checklistItems.map((item) => (
                      <div key={item.key} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => {
                            const action = item.completed ? 'uncheck' : 'complete'
                            toggleItemConfirmation.confirm(
                              () => toggleChecklistItem(onboarding.id, item.key, item.completed, item.task),
                              {
                                title: `${action === 'complete' ? 'Complete' : 'Uncheck'} Task`,
                                description: `Are you sure you want to ${action} "${item.task}"?`,
                                confirmText: action === 'complete' ? 'Complete' : 'Uncheck'
                              }
                            )
                          }}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.task}
                            {item.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
                            {item.auto_checked && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Auto</span>}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            {item.department}
                            {item.completed && item.completed_at && (
                              <span className="ml-2">• Completed {new Date(item.completed_at).toLocaleDateString()}</span>
                            )}
                            {item.completed_by && (
                              <span className="ml-2">• By {item.completed_by}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4">
                  <div className="w-full space-y-2">
                    {progress === 100 ? (
                      <Badge className="w-full justify-center bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Onboarding Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-full justify-center">
                        <Circle className="h-4 w-4 mr-2" />
                        Onboarding in Progress
                      </Badge>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => deleteOnboardingChecklist(onboarding.id, onboarding.applicant_name)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Checklist
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
      {/* Confirmation Modal for Toggle Item */}
      <ConfirmationModal
        open={toggleItemConfirmation.isOpen}
        onOpenChange={toggleItemConfirmation.setIsOpen}
        onConfirm={toggleItemConfirmation.onConfirm}
        title={toggleItemConfirmation.title || "Confirm Action"}
        description={toggleItemConfirmation.description || "Are you sure you want to proceed?"}
        confirmText={toggleItemConfirmation.confirmText || "Confirm"}
      />
    </motion.div>
  )
}
