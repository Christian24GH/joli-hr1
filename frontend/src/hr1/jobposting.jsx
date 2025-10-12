// src/pages/hr1/JobPosting.jsx
import React, { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Calendar, Users, Briefcase, Eye } from "lucide-react"
import { hr1 } from "@/api/hr1"

const api = hr1.backend.api

export default function JobPosting() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [applicants, setApplicants] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)

  // Fetch job postings from HR1
  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await axios.get(api.jobPostings)
      setJobs(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to fetch job postings", { position: "top-center" })
    } finally {
      setLoading(false)
    }
  }

  // Fetch applicants to calculate counts
  const fetchApplicants = async () => {
    try {
      const res = await axios.get(api.applicants)
      setApplicants(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error fetching applicants:", error)
    }
  }

  // Get applicant count for a specific job
  const getApplicantCount = (jobTitle) => {
    return applicants.filter(a => a.job === jobTitle || a.job_title === jobTitle).length
  }

  useEffect(() => {
    fetchJobs()
    fetchApplicants()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Available Vacancies</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Browse current job openings</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {jobs.length} {jobs.length === 1 ? 'Position' : 'Positions'} Available
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
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Vacancies Available</h3>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">There are currently no job openings. Check back later for new opportunities.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {job.department || 'General'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={job.status === 'open' ? 'default' : 'secondary'}
                    className={job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  >
                    {job.status === 'open' ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                  {job.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {job.location || 'Location TBD'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400 dark:text-gray-500">Salary: Not configured</span>
                  </div>
                  
                  {job.employment_type && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {job.employment_type}
                    </div>
                  )}
                  
                  {job.application_deadline && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Users className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {getApplicantCount(job.title)} applicant{getApplicantCount(job.title) !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {job.requirements && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Requirements:</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{job.requirements}</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedJob(job)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{job.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Job Information</h3>
                        <div className="space-y-2 text-sm">
                          <p><strong>Department:</strong> {job.department || 'N/A'}</p>
                          <p><strong>Location:</strong> {job.location || 'N/A'}</p>
                          <p><strong>Employment Type:</strong> {job.employment_type || 'N/A'}</p>
                          <p><strong>Salary:</strong> <span className="text-gray-400 dark:text-gray-500">Not configured</span></p>
                          <p><strong>Application Deadline:</strong> {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'N/A'}</p>
                          <p><strong>Status:</strong> <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>{job.status}</Badge></p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{job.description || 'No description provided'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Requirements</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{job.requirements || 'No requirements listed'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Responsibilities</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{job.responsibilities || 'No responsibilities listed'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Applicants</h3>
                        <p className="text-sm"><strong>{getApplicantCount(job.title)}</strong> applicants</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
