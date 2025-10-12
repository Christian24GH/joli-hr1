// src/hr1/hired-employees.jsx
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { hr1 } from "@/api/hr1"
import { motion } from "framer-motion"
import { 
  Award, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  MapPin, 
  DollarSign,
  CheckCircle,
  Filter,
  Download,
  Eye
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const api = hr1.backend.api

export default function HiredEmployeesPage() {
  const [hiredEmployees, setHiredEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const fetchHiredEmployees = useCallback(() => {
    setLoading(true)
    axios
      .get(api.applicants)
      .then((response) => {
        const data = response.data
        // Filter only hired employees
        const hired = Array.isArray(data) ? data.filter(applicant => 
          applicant.status === 'hired'
        ) : []
        setHiredEmployees(hired)
        setFilteredEmployees(hired)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Error fetching hired employees", { position: "top-center" })
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchHiredEmployees()
  }, [fetchHiredEmployees])

  // Filter employees based on search and filters
  useEffect(() => {
    let filtered = hiredEmployees

    // Search filter
    if (search) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        (emp.job_title && emp.job_title.toLowerCase().includes(search.toLowerCase())) ||
        (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(emp => emp.department === departmentFilter)
    }

    // Employment type filter
    if (employmentTypeFilter !== "all") {
      filtered = filtered.filter(emp => emp.employment_type === employmentTypeFilter)
    }

    setFilteredEmployees(filtered)
  }, [search, departmentFilter, employmentTypeFilter, hiredEmployees])

  // Get unique departments
  const departments = [...new Set(hiredEmployees.map(emp => emp.department).filter(Boolean))]
  
  // Get unique employment types
  const employmentTypes = [...new Set(hiredEmployees.map(emp => emp.employment_type).filter(Boolean))]

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Job Title", "Department", "Employment Type", "Hire Date", "Salary"]
    const rows = filteredEmployees.map(emp => [
      emp.name,
      emp.email,
      emp.phone || "",
      emp.job_title || emp.job || "",
      emp.department || "",
      emp.employment_type || "",
      emp.hire_date || "",
      emp.salary || ""
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hired-employees-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success("Employee list exported successfully", { position: "top-center" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hired Employees</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">View and manage employees who completed onboarding</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredEmployees.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Badge variant="outline" className="text-sm px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'Employee' : 'Employees'}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <Input
            placeholder="Search by name, email, job title, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Employment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {employmentTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      ) : filteredEmployees.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Award className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {hiredEmployees.length === 0 ? 'No Hired Employees Yet' : 'No Employees Found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {hiredEmployees.length === 0 
                ? 'Employees who complete onboarding will appear here.' 
                : 'Try adjusting your search or filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {employee.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {employee.job_title || employee.job || 'Not specified'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Hired
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span className="truncate">{employee.email}</span>
                </div>
                
                {employee.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {employee.phone}
                  </div>
                )}
                
                {employee.hire_date && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    Hired: {new Date(employee.hire_date).toLocaleDateString()}
                  </div>
                )}
                
                {employee.department && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {employee.department}
                  </div>
                )}
                
                {employee.employment_type && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Users className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {employee.employment_type}
                  </div>
                )}

                {employee.salary && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    ${employee.salary.toLocaleString()}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedEmployee(employee)
                    setShowDetailsDialog(true)
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics Summary */}
      {!loading && hiredEmployees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Hired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hiredEmployees.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hiredEmployees.filter(emp => {
                  if (!emp.hire_date) return false
                  const hireDate = new Date(emp.hire_date)
                  const now = new Date()
                  return hireDate.getMonth() === now.getMonth() && 
                         hireDate.getFullYear() === now.getFullYear()
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Employment Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employmentTypes.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-lg border-b pb-2">Personal Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Employee Code:</strong> {selectedEmployee.employee_code || 'N/A'}</p>
                  <p><strong>Name:</strong> {selectedEmployee.name}</p>
                  <p><strong>Email:</strong> {selectedEmployee.email}</p>
                  <p><strong>Phone:</strong> {selectedEmployee.phone || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-lg border-b pb-2">Job Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Job Title:</strong> {selectedEmployee.job_title || 'N/A'}</p>
                  <p><strong>Department:</strong> {selectedEmployee.department || 'N/A'}</p>
                  <p><strong>Employment Type:</strong> {selectedEmployee.employment_type || 'N/A'}</p>
                  <p><strong>Hire Date:</strong> {selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Status:</strong> <Badge variant="default" className="bg-green-100 text-green-800">{selectedEmployee.status}</Badge></p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-lg border-b pb-2">Emergency Contact</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Contact Name:</strong> {selectedEmployee.emergency_contact_name || 'N/A'}</p>
                  <p><strong>Contact Phone:</strong> {selectedEmployee.emergency_contact_phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedEmployee.emergency_contact_address || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
