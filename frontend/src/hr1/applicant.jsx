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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* PERSONAL INFO */}
          <div>
            <h3 className="font-semibold mb-2 text-lg border-b pb-2">Personal Info</h3>
            <div className="space-y-1">
              <p><b>Employee Code:</b> {item.employee_code || 'N/A'}</p>
              <p><b>Name:</b> {item.name || 'N/A'}</p>
              <p><b>Email:</b> {item.email || 'N/A'}</p>
              <p><b>Phone:</b> {item.phone || 'N/A'}</p>
              <p><b>Status:</b> {item.status || 'N/A'}</p>
              <p><b>Date of Application:</b> {item.hire_date || 'N/A'}</p>
            </div>
          </div>

          {/* JOB INFO */}
          <div>
            <h3 className="font-semibold mb-2 text-lg border-b pb-2">Job Info</h3>
            <div className="space-y-1">
              <p><b>Job Title:</b> {item.job_title || 'N/A'}</p>
              <p><b>Employment Type:</b> {item.employment_type || 'N/A'}</p>
              <p><b>Department:</b> {item.department || 'N/A'}</p>
              <p><b>Salary:</b> <span className="text-gray-400 dark:text-gray-500">Not configured</span></p>
            </div>
          </div>

          {/* EMERGENCY CONTACT */}
          <div>
            <h3 className="font-semibold mb-2 text-lg border-b pb-2">Emergency Contact</h3>
            <div className="space-y-1">
              <p><b>Contact Name:</b> {item.emergency_contact_name || 'N/A'}</p>
              <p><b>Contact Phone:</b> {item.emergency_contact_phone || 'N/A'}</p>
              <p><b>Address:</b> {item.emergency_contact_address || 'N/A'}</p>
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
          <div className="flex mb-3 gap-2">
            <Input
              placeholder="Search Name, Email, or Position"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
