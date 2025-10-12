import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, DollarSign, Users, Briefcase, Edit, Trash2, Eye, Calendar, TrendingUp, PieChart, X } from "lucide-react";
import { hr1 } from "@/api/hr1";
import { motion } from "framer-motion";
import { ConfirmationModal, useConfirmation } from "@/components/ui/confirmation-modal";

const api = hr1.backend.api

export default function OfferManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [financialData, setFinancialData] = useState(null);

  // For View/Edit modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // For confirmation modal
  const deleteConfirmation = useConfirmation();

  // Fetch job postings from HR1
  const fetchJobs = async () => {
    try {
      const res = await axios.get(api.jobPostings);
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch job postings", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch applicants to calculate counts
  const fetchApplicants = async () => {
    try {
      const res = await axios.get(api.applicants);
      setApplicants(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  // Get applicant count for a specific job
  const getApplicantCount = (jobTitle) => {
    return applicants.filter(a => a.job === jobTitle || a.job_title === jobTitle).length;
  };

  // ============ FINANCIAL CALCULATIONS (Ready for API Connection) ============
  
  // Calculate total salary budget from all job postings
  const calculateTotalBudget = () => {
    return jobs.reduce((total, job) => {
      const maxSalary = extractMaxSalaryFromRange(job.salary_range);
      return total + maxSalary;
    }, 0);
  };

  // Calculate committed salary (hired employees)
  const calculateCommittedSalary = () => {
    const hiredApplicants = applicants.filter(a => a.status === 'hired');
    return hiredApplicants.reduce((total, applicant) => {
      const salary = extractSalaryValue(applicant.salary);
      return total + salary;
    }, 0);
  };

  // Calculate potential savings
  const calculatePotentialSavings = () => {
    const totalBudget = calculateTotalBudget();
    const committed = calculateCommittedSalary();
    return totalBudget - committed;
  };

  // Get department-wise budget breakdown
  const getDepartmentBudgets = () => {
    const deptMap = {};
    
    jobs.forEach(job => {
      const dept = job.department || 'Unassigned';
      const maxSalary = extractMaxSalaryFromRange(job.salary_range);
      const applicantCount = getApplicantCount(job.title);
      const hiredCount = applicants.filter(a => 
        (a.job === job.title || a.job_title === job.title) && a.status === 'hired'
      ).length;
      
      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          budgeted: 0,
          committed: 0,
          positions: 0,
          hired: 0,
          applicants: 0
        };
      }
      
      deptMap[dept].budgeted += maxSalary;
      deptMap[dept].positions += 1;
      deptMap[dept].hired += hiredCount;
      deptMap[dept].applicants += applicantCount;
    });
    
    // Calculate committed for each department
    applicants.filter(a => a.status === 'hired').forEach(applicant => {
      const dept = applicant.department || 'Unassigned';
      const salary = extractSalaryValue(applicant.salary);
      if (deptMap[dept]) {
        deptMap[dept].committed += salary;
      }
    });
    
    return Object.values(deptMap);
  };

  // Helper: Extract maximum salary from range string
  const extractMaxSalaryFromRange = (salaryRange) => {
    if (!salaryRange) return 0;
    if (typeof salaryRange === 'number') return salaryRange;
    
    // Extract numbers from string like "$2,500 - $3,500/month"
    const matches = salaryRange.match(/[\d,]+/g);
    if (matches && matches.length >= 2) {
      // Get the second number (max)
      return parseFloat(matches[1].replace(/,/g, ''));
    } else if (matches && matches.length === 1) {
      return parseFloat(matches[0].replace(/,/g, ''));
    }
    return 0;
  };

  // Helper: Extract salary value from applicant
  const extractSalaryValue = (salary) => {
    if (!salary) return 0;
    if (typeof salary === 'number') return salary;
    
    // Extract first number from string
    const matches = salary.match(/[\d,]+/g);
    if (matches && matches.length > 0) {
      return parseFloat(matches[0].replace(/,/g, ''));
    }
    return 0;
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate financial metrics
  const getFinancialMetrics = () => {
    const totalBudget = calculateTotalBudget();
    const committed = calculateCommittedSalary();
    const savings = calculatePotentialSavings();
    const hiredCount = applicants.filter(a => a.status === 'hired').length;
    const avgSalary = hiredCount > 0 ? committed / hiredCount : 0;
    
    return {
      totalBudget,
      committed,
      savings,
      hiredCount,
      avgSalary,
      utilizationRate: totalBudget > 0 ? (committed / totalBudget) * 100 : 0
    };
  };

  // ============ END FINANCIAL CALCULATIONS ============

  useEffect(() => {
    fetchJobs();
    fetchApplicants();
  }, []);

  // Delete job posting
  const deleteJob = async (id) => {
    try {
      await axios.delete(`${api.jobPostings}/${id}`);
      setJobs(jobs.filter((job) => job.id !== id));
      toast.success("Job posting deleted successfully", { position: "top-center" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job posting", { position: "top-center" });
    }
  };

  // Update job posting
  const updateJob = async () => {
    try {
      const res = await axios.put(`${api.jobPostings}/${selectedJob.id}`, selectedJob);
      setJobs(
        jobs.map((job) => (job.id === selectedJob.id ? res.data : job))
      );
      toast.success("Job posting updated successfully", { position: "top-center" });
      setSelectedJob(null);
      setEditMode(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job posting", { position: "top-center" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Offer Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage job offers and positions</p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          <Briefcase className="h-4 w-4 mr-2" />
          {jobs.length} {jobs.length === 1 ? 'Offer' : 'Offers'} Available
        </Badge>
      </div>

      {/* Financial Summary Cards - Hidden until financial system is connected */}
      {false && !loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(getFinancialMetrics().totalBudget)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum salary budget
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Committed</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(getFinancialMetrics().committed)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {getFinancialMetrics().hiredCount} hired employees
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Budget</CardTitle>
              <PieChart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(getFinancialMetrics().savings)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Remaining budget
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(getFinancialMetrics().avgSalary)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per hired employee
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Budget Breakdown - Hidden until financial system is connected */}
      {false && !loading && jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Budget Analysis</CardTitle>
            <CardDescription>Budget allocation and utilization by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getDepartmentBudgets().map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{dept.department}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {dept.positions} positions • {dept.hired} hired • {dept.applicants} applicants
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(dept.committed)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">of {formatCurrency(dept.budgeted)}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${dept.budgeted > 0 ? (dept.committed / dept.budgeted) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">There are currently no job openings to manage. Check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Position #{index + 1}
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
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {job.location || 'Location TBD'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
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
                  
                  {job.department && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {job.department}
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
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedJob(job);
                      setEditMode(false);
                      setShowDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedJob(job);
                      setEditMode(true);
                      setShowDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => deleteConfirmation.confirm(() => deleteJob(job.id))}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for View/Edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="!w-[60vw] h-[vh] !max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editMode ? "Edit Vacancy" : "Vacancy Details"}</DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm">Title</label>
                <input
                  type="text"
                  value={selectedJob.title || ''}
                  disabled={!editMode}
                  onChange={(e) =>
                    setSelectedJob({ ...selectedJob, title: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm">Description</label>
                <textarea
                  value={selectedJob.description || ''}
                  disabled={!editMode}
                  onChange={(e) =>
                    setSelectedJob({
                      ...selectedJob,
                      description: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm">Location</label>
                <input
                  type="text"
                  value={selectedJob.location || ''}
                  disabled={!editMode}
                  onChange={(e) =>
                    setSelectedJob({ ...selectedJob, location: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              {/* Salary fields hidden until financial system is connected */}
              {false && (
                <div>
                  <label className="block text-sm">Salary Information</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300">Min Salary</label>
                      <input
                        type="number"
                        value={selectedJob.salary_min || ''}
                        disabled={!editMode}
                        onChange={(e) =>
                          setSelectedJob({ ...selectedJob, salary_min: e.target.value ? parseInt(e.target.value) : null })
                        }
                        className="border p-2 w-full rounded"
                        placeholder="e.g. 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300">Max Salary</label>
                      <input
                        type="number"
                        value={selectedJob.salary_max || ''}
                        disabled={!editMode}
                        onChange={(e) =>
                          setSelectedJob({ ...selectedJob, salary_max: e.target.value ? parseInt(e.target.value) : null })
                        }
                        className="border p-2 w-full rounded"
                        placeholder="e.g. 80000"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-300">Fixed Salary (if applicable)</label>
                    <input
                      type="number"
                      value={selectedJob.salary || ''}
                      disabled={!editMode}
                      onChange={(e) =>
                        setSelectedJob({ ...selectedJob, salary: e.target.value ? parseInt(e.target.value) : null })
                      }
                      className="border p-2 w-full rounded"
                      placeholder="e.g. 65000"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm">Status</label>
                <select
                  value={selectedJob.status || 'open'}
                  disabled={!editMode}
                  onChange={(e) =>
                    setSelectedJob({ ...selectedJob, status: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setSelectedJob(null);
                  }}
                >
                  Close
                </Button>
                {editMode && (
                  <Button
                    onClick={updateJob}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setIsOpen}
        onConfirm={deleteConfirmation.onConfirm}
        title="Delete Job Posting"
        description="Are you sure you want to delete this job posting? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </motion.div>
  );
}
