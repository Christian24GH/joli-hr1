import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { hr1 } from "@/api/hr1"

const api = hr1.backend.api

export default function RegisterDialog({ onApplicantAdded }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobPostings, setJobPostings] = useState([])
  const [selectedJobId, setSelectedJobId] = useState("")
  const [formData, setFormData] = useState({
    employee_code: "",
    name: "",
    email: "",
    phone: "",
    status: "pending",
    hire_date: "",
    job: "",
    job_title: "",
    employment_type: "",
    department: "",
    salary: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_address: "",
  })

  const generateEmployeeCode = async () => {
    try {
      // Fetch existing applicants to get the next sequential number
      const response = await axios.get(api.applicants)
      const applicants = Array.isArray(response.data) ? response.data : []
      
      console.log("Fetched applicants for code generation:", applicants)
      
      // Find the highest employee code number
      let maxNumber = 0
      applicants.forEach(applicant => {
        console.log("Checking applicant:", applicant.employee_code)
        if (applicant.employee_code && applicant.employee_code.startsWith('EMP')) {
          const numberPart = applicant.employee_code.replace('EMP', '')
          const num = parseInt(numberPart, 10)
          console.log("Parsed number:", num)
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num
          }
        }
      })
      
      console.log("Max number found:", maxNumber)
      
      // Generate next sequential number
      const nextNumber = (maxNumber + 1).toString().padStart(3, '0')
      const generatedCode = `EMP${nextNumber}`
      console.log("Generated code:", generatedCode)
      return generatedCode
    } catch (error) {
      console.error("Error generating employee code:", error)
      // Fallback to 001 if API fails
      return `EMP001`
    }
  }

  const fetchJobPostings = useCallback(() => {
    axios
      .get(api.jobPostings)
      .then((response) => {
        const data = response.data
        setJobPostings(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        console.error("Error fetching job postings:", error)
        setJobPostings([])
      })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleJobPostingChange = (jobPostingId) => {
    setSelectedJobId(jobPostingId)
    const selectedJob = jobPostings.find(job => job.id === parseInt(jobPostingId))
    if (selectedJob) {
      setFormData((prev) => ({
        ...prev,
        job: selectedJob.title,
        job_title: selectedJob.title,
        department: selectedJob.department,
        employment_type: selectedJob.employment_type,
        salary: selectedJob.salary_range || '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log("Form submitted!")
    console.log("Selected Job ID:", selectedJobId)
    console.log("Form Data:", formData)
    
    // Validate job selection
    if (!selectedJobId || !formData.job_title) {
      toast.error("Please select a job position", { position: "top-center" })
      return
    }
    
    // Remove salary field since financial system is not connected
    const { salary, ...submitData } = formData
    console.log("Submitting data:", submitData)
    
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:8091/api/applicants", submitData)

      // Refresh parent list
      if (onApplicantAdded) {
        onApplicantAdded(res.data)
      }

      // Show success toast
      toast.success("Applicant registered successfully!", { position: "top-center" })

      // Reset form + close dialog
      setFormData({ 
        employee_code: "", 
        name: "", 
        email: "", 
        phone: "", 
        status: "pending", 
        hire_date: "", 
        job: "",
        job_title: "",
        employment_type: "",
        department: "",
        salary: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_address: "",
      })
      setSelectedJobId("")
      setOpen(false)
    } catch (err) {
      console.error("Error saving applicant:", err)
      console.error("Error response:", err.response?.data)
      console.error("Form data being sent:", submitData)
      
      // Show validation errors if available
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat()
        toast.error(errors.join(', '), { position: "top-center" })
      } else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to register applicant"
        toast.error(errorMessage, { position: "top-center" })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchJobPostings()
      // Auto-generate employee code when dialog opens
      generateEmployeeCode().then(code => {
        setFormData(prev => ({
          ...prev,
          employee_code: code
        }))
      })
    }
  }, [open, fetchJobPostings])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Applicant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Applicant</DialogTitle>
          <DialogDescription>
            Add a new applicant to the system
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Personal Info</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_code">Employee Code</Label>
                <Input
                  id="employee_code"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  placeholder="Auto-generated"
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="interviewed">Interviewed</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">Apply Date *</Label>
                <Input
                  id="hire_date"
                  name="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Job Info Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Job Info</h3>
            
            <div className="space-y-2">
              <Label htmlFor="job_posting">Select Job Position *</Label>
              <Select value={selectedJobId} onValueChange={handleJobPostingChange}>
                <SelectTrigger className={!selectedJobId ? "border-red-300" : ""}>
                  <SelectValue placeholder="Choose a job position" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {jobPostings.length === 0 ? (
                    <SelectItem value="none" disabled>No job postings available</SelectItem>
                  ) : (
                    jobPostings
                      .filter(job => job.status === 'open')
                      .map((job) => (
                        <SelectItem key={job.id} value={job.id.toString()}>
                          {job.title} - {job.department}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Job Title, Department, and Employment Type will be auto-filled
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  placeholder="Auto-filled from job posting"
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Input
                  id="employment_type"
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  placeholder="Auto-filled from job posting"
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Auto-filled from job posting"
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Salary field hidden until financial system is connected */}
              {false && (
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Auto-filled from job posting"
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Emergency Contact</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="Enter contact name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  placeholder="Enter contact phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_address">Address</Label>
              <Input
                id="emergency_contact_address"
                name="emergency_contact_address"
                value={formData.emergency_contact_address}
                onChange={handleChange}
                placeholder="Enter emergency contact address"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Applicant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
