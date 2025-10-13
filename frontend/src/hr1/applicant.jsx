// src/hr1/applicant.jsx
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useEchoPublic } from "@laravel/echo-react"
import { hr1 } from "@/api/hr1"
import PaginationComponent from "@/components/hr1/pagination"
import TableComponent from "@/components/hr1/table"
import RegisterDialog from "@/components/hr1/register-dialog"
import UpdateDialog from "@/components/hr1/edit-dialog"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const api = hr1.backend.api
const reverb = hr1.reverb
reverb.config()

// --- DASHBOARD TABLE COLUMNS (only personal info) ---
const header = [
  { title: "Employee Code", accessor: "employee_code" },
  { title: "Name", accessor: "name", cellClassName: "font-medium" },
  { title: "Email", accessor: "email" },
  { title: "Phone", accessor: "phone" },
  { title: "Status", accessor: "status" },
  { title: "Date of Application", accessor: "hire_date" },
  { title: "Job", accessor: "job" },
  {
    title: "Actions",
    render: (item) => (
      <div className="flex gap-2 justify-end">
        <UpdateDialog item={item} />
        <ViewDialog item={item} />
      </div>
    ),
  },
]

// --- VIEW DIALOG COMPONENT ---
function ViewDialog({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-none max-h-[90vh]" style={{ width: '75vw', maxWidth: '75vw' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* PERSONAL INFO */}
          <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg">
            <h3 className="font-semibold mb-4 text-xl border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-4 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Employee Code</p>
                <p className="font-medium break-words">{item.employee_code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">First Name</p>
                <p className="font-medium break-words">{item.first_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Name</p>
                <p className="font-medium break-words">{item.last_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                <p className="font-medium break-words">{item.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="font-medium break-all text-sm">{item.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                <p className="font-medium break-words">{item.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date of Birth</p>
                <p className="font-medium break-words">{item.date_of_birth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gender</p>
                <p className="font-medium break-words">{item.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Marital Status</p>
                <p className="font-medium break-words">{item.marital_status || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nationality</p>
                <p className="font-medium break-words">{item.nationality || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Years of Experience</p>
                <p className="font-medium break-words">{item.years_of_experience || '0'} years</p>
              </div>
              <div className="col-span-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
                <p className="font-medium break-words">{item.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* JOB INFO */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg">
            <h3 className="font-semibold mb-4 text-xl border-b pb-2">Job Information</h3>
            <div className="grid grid-cols-4 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Job Title</p>
                <p className="font-medium break-words">{item.job_title || item.job || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Department</p>
                <p className="font-medium break-words">{item.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Applied Date</p>
                <p className="font-medium break-words">{item.hire_date || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded text-sm ${
                    item.status === 'hired' ? 'bg-green-100 text-green-800' :
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status || 'N/A'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* GOVERNMENT IDs */}
          <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-lg">
            <h3 className="font-semibold mb-4 text-xl border-b pb-2">Government IDs</h3>
            <div className="grid grid-cols-4 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">TIN (Tax ID)</p>
                <p className="font-medium break-words">{item.tax_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">SSS Number</p>
                <p className="font-medium break-words">{item.sss_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">PhilHealth Number</p>
                <p className="font-medium break-words">{item.philhealth_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pag-IBIG Number</p>
                <p className="font-medium break-words">{item.pagibig_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* EMERGENCY CONTACT */}
          <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-lg">
            <h3 className="font-semibold mb-4 text-xl border-b pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-4 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contact Name</p>
                <p className="font-medium break-words">{item.emergency_contact || item.emergency_contact_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contact Phone</p>
                <p className="font-medium break-words">{item.emergency_phone || item.emergency_contact_phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ApplicantPage() {
  const [applicants, setApplicants] = useState([])
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const [search, setSearch] = useState("")

  const fetchApplicants = useCallback(() => {
    axios
      .get(api.applicants, { params: { page, q: search || undefined } })
      .then((response) => {
        const data = response.data
        setApplicants(Array.isArray(data) ? data : [])
        setTotalPage(1)
      })
      .catch(() =>
        toast.error("Error fetching applicants", { position: "top-center" })
      )
  }, [page, search])

  useEffect(() => {
    const delayDebounce = setTimeout(fetchApplicants, 300)
    return () => clearTimeout(delayDebounce)
  }, [fetchApplicants])

  useEchoPublic("applicant_channel", "ApplicantUpdates", (e) => {
    let a = e.applicant
    setApplicants((prev) => {
      const exist = prev.find((item) => item.id === a.id)
      if (exist) return prev.map((item) => (item.id === a.id ? a : item))
      return [...prev, a]
    })
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3 gap-2">
            <Input
              placeholder="Search Name, Email, or Position"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <RegisterDialog onApplicantAdded={fetchApplicants} />
          </div>

          <div className="min-h-96">
            <TableComponent
              list={applicants}
              recordName="applicant"
              columns={header}
            />
          </div>
        </div>

        <PaginationComponent
          totalPage={totalPage}
          page={page}
          setPage={setPage}
          className="mt-4"
        />
      </div>
    </motion.div>
  )
}
