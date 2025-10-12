import { useState, useEffect } from "react"
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

export default function UpdateDialog({ item }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobPostings, setJobPostings] = useState([])
  const [formData, setFormData] = useState({
    employee_code: item.employee_code || "",
    name: item.name || "",
    email: item.email || "",
    phone: item.phone || "",
    status: item.status || "pending",
    hire_date: item.hire_date || "",
    job: item.job || "",
    job_title: item.job_title || "",
    employment_type: item.employment_type || "",
    department: item.department || "",
    salary: item.salary || "",
    emergency_contact_name: item.emergency_contact_name || "",
    emergency_contact_phone: item.emergency_contact_phone || "",
    emergency_contact_address: item.emergency_contact_address || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const fetchJobPostings = () => {
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
  }

  const sendToHR4 = async (employeeData) => {
    try {
      // TODO: Replace with actual HR4 API endpoint when available
      const HR4_API_URL = 'http://localhost:8094/api/employees' // Update this with HR4 endpoint
      
      // Prepare employee data for HR4 Payroll system
      const hr4EmployeeData = {
        employee_code: employeeData.employee_code,
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        job_title: employeeData.job_title,
        employment_type: employeeData.employment_type,
        department: employeeData.department,
        salary: employeeData.salary,
        hire_date: employeeData.hire_date,
        status: 'active',
        // Add any additional fields HR4 needs
      }

      // Send to HR4 Payroll system
      await axios.post(HR4_API_URL, hr4EmployeeData)
      console.log("Employee data sent to HR4 successfully:", hr4EmployeeData)
      toast.success("Employee data sent to HR4 Payroll system!", { position: "top-center" })
    } catch (error) {
      console.error("Error sending data to HR4:", error)
      toast.error("Warning: Failed to send data to HR4 Payroll system", { position: "top-center" })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Remove salary field since financial system is not connected
      const { salary, ...updateData } = formData
      
      // Update applicant in HR1
      await axios.put(`${api.applicants}/${item.id}`, updateData)
      toast.success("Applicant updated successfully!", { position: "top-center" })
      
      // If status changed to "hired", send data to HR4
      if (formData.status === 'hired' && item.status !== 'hired') {
        await sendToHR4(updateData)
      }
      
      setOpen(false)
      // Refresh the page or parent component
      window.location.reload()
    } catch (err) {
      console.error("Error updating applicant:", err)
      toast.error("Failed to update applicant. Check console.", { position: "top-center" })
    } finally {
      setLoading(false)
    }
  }

  // Fetch job postings when dialog opens
  useEffect(() => {
    if (open) {
      fetchJobPostings()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Applicant</DialogTitle>
          <DialogDescription>
            Update applicant information
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title *</Label>
                <Select value={formData.job_title} onValueChange={(value) => handleSelectChange('job_title', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job title from postings" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobPostings.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No job postings available</div>
                    ) : (
                      jobPostings.map((job) => (
                        <SelectItem key={job.id} value={job.title || job.job_title || job.position}>
                          {job.title || job.job_title || job.position}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select value={formData.employment_type} onValueChange={(value) => handleSelectChange('employment_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
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
                  placeholder="Enter department"
                />
              </div>

              {/* Salary field hidden until financial system is connected */}
              {false && (
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Enter salary"
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
              {loading ? "Updating..." : "Update Applicant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
