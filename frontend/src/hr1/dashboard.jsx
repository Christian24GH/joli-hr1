
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { hr1 } from "@/api/hr1"
import { motion } from "framer-motion"
import { Users, UserCheck, UserX, Calendar, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react"

const api = hr1.backend.api

export default function Hr1Dashboard() {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    interviewed: 0,
    hired: 0
  })
  const [monthlyData, setMonthlyData] = useState([])

  const calculateMonthlyStats = (applicantData) => {
    const months = []
    const now = new Date()
    const currentYear = now.getFullYear()
    
    // Get all 12 months starting from January
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      // Count applicants for this month
      const count = applicantData.filter(applicant => {
        const applicantDate = new Date(applicant.created_at || applicant.hire_date || applicant.application_date)
        return applicantDate.getMonth() === i && 
               applicantDate.getFullYear() === currentYear
      }).length
      
      months.push({
        month: `${monthName} ${currentYear}`,
        monthShort: monthName,
        count: count
      })
    }
    
    return months
  }

  const fetchApplicants = useCallback(() => {
    setLoading(true)
    axios
      .get(api.applicants)
      .then((response) => {
        const data = response.data
        const applicantData = Array.isArray(data) ? data : []
        setApplicants(applicantData)
        
        // Update statistics based on real data
        const newStats = {
          total: applicantData.length,
          pending: applicantData.filter(a => a.status === 'pending').length,
          approved: applicantData.filter(a => a.status === 'approved').length,
          rejected: applicantData.filter(a => a.status === 'rejected').length,
          interviewed: applicantData.filter(a => a.status === 'interviewed').length,
          hired: applicantData.filter(a => a.status === 'hired').length
        }
        setStats(newStats)
        
        // Calculate monthly application data (last 6 months)
        const monthlyStats = calculateMonthlyStats(applicantData)
        setMonthlyData(monthlyStats)
        
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'interviewed': return 'bg-blue-100 text-blue-800'
      case 'hired': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'hired':
        return <UserCheck className="h-4 w-4" />
      case 'rejected':
        return <UserX className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const recentApplicants = applicants
    .sort((a, b) => new Date(b.created_at || b.application_date) - new Date(a.created_at || a.application_date))
    .slice(0, 5)

  useEffect(() => {
    fetchApplicants()
  }, [fetchApplicants])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Human Resources Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Overview of recruitment and employee management</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time applications
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Ready for next steps
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviewed</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.interviewed}</div>
            <p className="text-xs text-muted-foreground">
              Completed interviews
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.hired}</div>
            <p className="text-xs text-muted-foreground">
              Successfully hired
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Not suitable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Application Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of all applicant statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[
                { label: 'Pending', count: stats.pending, color: 'bg-yellow-500' },
                { label: 'Approved', count: stats.approved, color: 'bg-green-500' },
                { label: 'Interviewed', count: stats.interviewed, color: 'bg-blue-500' },
                { label: 'Hired', count: stats.hired, color: 'bg-purple-500' },
                { label: 'Rejected', count: stats.rejected, color: 'bg-red-500' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium dark:text-gray-200">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.count}</span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                      {stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Application Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Application Trends ({new Date().getFullYear()})
            </CardTitle>
            <CardDescription>
              Application volume by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Line Graph Container */}
              <div className="relative bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 p-3 rounded-lg">
                <svg className="w-full h-32" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <line
                      key={percent}
                      x1="0"
                      y1={200 - (percent * 2)}
                      x2="600"
                      y2={200 - (percent * 2)}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-gray-300 dark:text-gray-700"
                      strokeDasharray="4 4"
                    />
                  ))}
                  
                  {/* Area under the line */}
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(37, 99, 235)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="rgb(37, 99, 235)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {monthlyData.length > 0 && (
                    <>
                      {/* Area fill */}
                      <path
                        d={`M 0 200 ${monthlyData.map((data, index) => {
                          const maxCount = Math.max(...monthlyData.map(d => d.count), 1)
                          const x = (index / (monthlyData.length - 1)) * 600
                          const y = 200 - ((data.count / maxCount) * 180)
                          return `L ${x} ${y}`
                        }).join(' ')} L 600 200 Z`}
                        fill="url(#lineGradient)"
                      />
                      
                      {/* Line */}
                      <polyline
                        points={monthlyData.map((data, index) => {
                          const maxCount = Math.max(...monthlyData.map(d => d.count), 1)
                          const x = (index / (monthlyData.length - 1)) * 600
                          const y = 200 - ((data.count / maxCount) * 180)
                          return `${x},${y}`
                        }).join(' ')}
                        fill="none"
                        stroke="rgb(37, 99, 235)"
                        strokeWidth="3"
                        className="dark:stroke-blue-400"
                      />
                      
                      {/* Data points */}
                      {monthlyData.map((data, index) => {
                        const maxCount = Math.max(...monthlyData.map(d => d.count), 1)
                        const x = (index / (monthlyData.length - 1)) * 600
                        const y = 200 - ((data.count / maxCount) * 180)
                        return (
                          <g key={data.month}>
                            <circle
                              cx={x}
                              cy={y}
                              r="8"
                              fill="white"
                              stroke="rgb(37, 99, 235)"
                              strokeWidth="3"
                              className="dark:fill-gray-900 dark:stroke-blue-400"
                            />
                            <text
                              x={x}
                              y={y}
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="text-[10px] font-bold fill-blue-600 dark:fill-blue-400"
                              style={{ pointerEvents: 'none' }}
                            >
                              {data.count}
                            </text>
                          </g>
                        )
                      })}
                    </>
                  )}
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div className="flex justify-between px-3">
                {monthlyData.map((data) => (
                  <div key={data.month} className="flex-1 text-center">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{data.monthShort}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Applications
            </CardTitle>
            <CardDescription>
              Latest applicant submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentApplicants.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent applications</p>
            ) : (
              <div className="space-y-2">
                {recentApplicants.map((applicant) => (
                  <div key={applicant.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(applicant.status)}
                      <div>
                        <div className="font-medium text-sm dark:text-gray-200">{applicant.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{applicant.job_title}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(applicant.status)}>
                      {applicant.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common HR management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => window.location.href = '/hr1/applicant'}
              className="p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors text-left"
            >
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-1" />
              <div className="font-medium text-sm">View Applicants</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Manage applications</div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/hr1/jobposting'}
              className="p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors text-left"
            >
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
              <div className="font-medium text-sm">Job Postings</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Create new positions</div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/hr1/interview'}
              className="p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors text-left"
            >
              <Calendar className="h-5 w-5 text-purple-600 mb-1" />
              <div className="font-medium text-sm">Interviews</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Schedule interviews</div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/hr1/onboarding'}
              className="p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors text-left"
            >
              <UserCheck className="h-5 w-5 text-orange-600 mb-1" />
              <div className="font-medium text-sm">Onboarding</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">New hire process</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}