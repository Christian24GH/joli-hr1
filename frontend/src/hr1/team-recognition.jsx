import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { hr1 } from '@/api/hr1'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star,
  TrendingUp,
  Users,
  Target,
  Award,
  Plus,
  Calendar,
  BarChart3,
  Zap,
  Shield,
  Flame
} from "lucide-react"

const api = hr1.backend.api

export default function Hr1TeamRecognition() {
  const [employees, setEmployees] = useState([])
  const [teams, setTeams] = useState([])
  const [teamAwards, setTeamAwards] = useState([])
  const [teamRankings, setTeamRankings] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAwardDialog, setShowAwardDialog] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  
  const [newTeamAward, setNewTeamAward] = useState({
    team_id: '',
    award_type: '',
    reason: '',
    points: 0
  })

  // Team award types based on collective performance
  const teamAwardTypes = [
    { id: 'top_attendance_team', name: 'Top Attendance Team', icon: Calendar, color: 'text-green-600', points: 500, criteria: 'avg_attendance >= 95' },
    { id: 'punctuality_champions', name: 'Punctuality Champions', icon: Zap, color: 'text-blue-600', points: 400, criteria: 'avg_punctuality >= 90' },
    { id: 'shift_excellence', name: 'Shift Excellence Team', icon: Shield, color: 'text-purple-600', points: 450, criteria: 'avg_compliance >= 88' },
    { id: 'most_improved_team', name: 'Most Improved Team', icon: TrendingUp, color: 'text-orange-600', points: 350, criteria: 'improvement_trend > 5' },
    { id: 'consistency_award', name: 'Consistency Award', icon: Target, color: 'text-indigo-600', points: 300, criteria: 'consistency_score >= 85' },
    { id: 'performance_excellence', name: 'Performance Excellence', icon: Trophy, color: 'text-yellow-600', points: 600, criteria: 'overall_score >= 90' }
  ]

  // HR3 Integration Functions for Team Data
  const fetchTeamHR3Data = async (teamMembers) => {
    try {
      // TODO: Replace with actual HR3 team performance API
      // const response = await axios.post('http://localhost:8093/api/team/performance', { member_ids: teamMembers })
      // return response.data
      
      // Mock team performance calculation
      const mockAttendance = teamMembers.map(() => Math.floor(Math.random() * 20) + 80)
      const mockPunctuality = teamMembers.map(() => Math.floor(Math.random() * 25) + 75)
      const mockCompliance = teamMembers.map(() => Math.floor(Math.random() * 30) + 70)
      
      return {
        avg_attendance: Math.round(mockAttendance.reduce((a, b) => a + b, 0) / mockAttendance.length),
        avg_punctuality: Math.round(mockPunctuality.reduce((a, b) => a + b, 0) / mockPunctuality.length),
        avg_compliance: Math.round(mockCompliance.reduce((a, b) => a + b, 0) / mockCompliance.length),
        improvement_trend: Math.floor(Math.random() * 21) - 10, // -10 to +10
        consistency_score: Math.floor(Math.random() * 30) + 70, // 70-100
        team_size: teamMembers.length
      }
    } catch (error) {
      console.error("Error fetching team HR3 data:", error)
      return {
        avg_attendance: 0,
        avg_punctuality: 0,
        avg_compliance: 0,
        improvement_trend: 0,
        consistency_score: 0,
        team_size: 0
      }
    }
  }

  // Group employees into teams by department
  const organizeTeams = useCallback(async (employeeList) => {
    const teamsByDepartment = employeeList.reduce((acc, employee) => {
      const dept = employee.department || 'Unassigned'
      if (!acc[dept]) {
        acc[dept] = []
      }
      acc[dept].push(employee)
      return acc
    }, {})

    const teamsWithMetrics = []
    
    for (const [department, members] of Object.entries(teamsByDepartment)) {
      if (members.length > 0) {
        const memberIds = members.map(m => m.id)
        const teamMetrics = await fetchTeamHR3Data(memberIds)
        
        // Calculate overall team score
        const overall_score = Math.round(
          (teamMetrics.avg_attendance + teamMetrics.avg_punctuality + teamMetrics.avg_compliance) / 3
        )

        teamsWithMetrics.push({
          id: department.toLowerCase().replace(/\s+/g, '_'),
          name: department,
          members: members,
          member_count: members.length,
          // Team performance metrics from HR3
          avg_attendance: teamMetrics.avg_attendance,
          avg_punctuality: teamMetrics.avg_punctuality,
          avg_compliance: teamMetrics.avg_compliance,
          overall_score: overall_score,
          improvement_trend: teamMetrics.improvement_trend,
          consistency_score: teamMetrics.consistency_score
        })
      }
    }

    return teamsWithMetrics
  }, [])

  // Calculate team rankings
  const calculateTeamRankings = useCallback((teamList) => {
    const rankings = [...teamList]
      .sort((a, b) => b.overall_score - a.overall_score)
      .map((team, index) => ({
        ...team,
        rank: index + 1,
        rank_change: Math.floor(Math.random() * 5) - 2 // -2 to +2 rank change
      }))
    
    setTeamRankings(rankings)
    return rankings
  }, [])

  // Auto-assign team awards
  const autoAssignTeamAwards = (teamList) => {
    const newAwards = []
    
    teamList.forEach(team => {
      teamAwardTypes.forEach(awardType => {
        const meetsAward = evaluateTeamCriteria(team, awardType.criteria)
        if (meetsAward) {
          // Check if award already exists
          const existingAward = teamAwards.find(a => 
            a.team_id === team.id && a.award_type === awardType.id
          )
          
          if (!existingAward) {
            newAwards.push({
              id: Date.now() + Math.random(),
              team_id: team.id,
              team_name: team.name,
              award_type: awardType.id,
              award_name: awardType.name,
              reason: `Automatically awarded for ${awardType.name.toLowerCase()}`,
              points: awardType.points,
              date_awarded: new Date().toISOString().split('T')[0],
              awarded_by: 'System (HR3 Integration)'
            })
          }
        }
      })
    })
    
    if (newAwards.length > 0) {
      setTeamAwards(prev => [...prev, ...newAwards])
      toast.success(`${newAwards.length} new team awards automatically assigned!`, { position: "top-center" })
    }
  }

  // Evaluate team award criteria
  const evaluateTeamCriteria = (team, criteria) => {
    try {
      const expression = criteria
        .replace(/avg_attendance/g, team.avg_attendance)
        .replace(/avg_punctuality/g, team.avg_punctuality)
        .replace(/avg_compliance/g, team.avg_compliance)
        .replace(/overall_score/g, team.overall_score)
        .replace(/improvement_trend/g, team.improvement_trend)
        .replace(/consistency_score/g, team.consistency_score)
      
      return eval(expression)
    } catch (error) {
      console.error('Error evaluating team criteria:', error)
      return false
    }
  }

  // Fetch employees and organize teams
  const fetchEmployeesAndTeams = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(api.applicants)
      const data = response.data
      const hiredEmployees = Array.isArray(data) ? data.filter(applicant => 
        applicant.status === 'hired'
      ) : []

      setEmployees(hiredEmployees)
      
      // Organize into teams and fetch HR3 metrics
      const teamsWithMetrics = await organizeTeams(hiredEmployees)
      setTeams(teamsWithMetrics)
      
      // Calculate rankings
      calculateTeamRankings(teamsWithMetrics)
      
      // Auto-assign team awards
      autoAssignTeamAwards(teamsWithMetrics)
      
    } catch (error) {
      console.error("Error fetching employees and teams:", error)
      setEmployees([])
      setTeams([])
    } finally {
      setLoading(false)
    }
  }, [organizeTeams, calculateTeamRankings])

  // Create manual team award
  const createTeamAward = () => {
    if (!newTeamAward.team_id || !newTeamAward.award_type || !newTeamAward.reason) {
      toast.error("Please fill in all required fields", { position: "top-center" })
      return
    }

    const team = teams.find(t => t.id === newTeamAward.team_id)
    const awardType = teamAwardTypes.find(a => a.id === newTeamAward.award_type)
    
    const award = {
      id: Date.now(),
      team_id: newTeamAward.team_id,
      team_name: team?.name || "",
      award_type: newTeamAward.award_type,
      award_name: awardType?.name || "",
      reason: newTeamAward.reason,
      points: newTeamAward.points || awardType?.points || 0,
      date_awarded: new Date().toISOString().split('T')[0],
      awarded_by: 'Manual Assignment'
    }

    setTeamAwards(prev => [...prev, award])
    toast.success(`Team award created for ${team?.name}`, { position: "top-center" })
    resetAwardDialog()
  }

  const resetAwardDialog = () => {
    setShowAwardDialog(false)
    setNewTeamAward({ team_id: '', award_type: '', reason: '', points: 0 })
  }

  const getTeamAwards = (teamId) => {
    return teamAwards.filter(award => award.team_id === teamId)
  }

  const getTeamTotalPoints = (teamId) => {
    return teamAwards
      .filter(award => award.team_id === teamId)
      .reduce((total, award) => total + award.points, 0)
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />
      case 2: return <Medal className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      case 3: return <Trophy className="h-6 w-6 text-amber-600" />
      default: return <Star className="h-6 w-6 text-gray-300" />
    }
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600"
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500"
      case 3: return "bg-gradient-to-r from-amber-400 to-amber-600"
      default: return "bg-gradient-to-r from-blue-400 to-blue-600"
    }
  }

  useEffect(() => {
    fetchEmployeesAndTeams()
  }, [fetchEmployeesAndTeams])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Recognition</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Team performance rankings and awards based on HR3 attendance data</p>
        </div>
        <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Team Award
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team Award</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={(value) => setNewTeamAward(prev => ({ ...prev, team_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} ({team.member_count} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select onValueChange={(value) => {
                const awardType = teamAwardTypes.find(a => a.id === value)
                setNewTeamAward(prev => ({ 
                  ...prev, 
                  award_type: value,
                  points: awardType?.points || 0
                }))
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select award type" />
                </SelectTrigger>
                <SelectContent>
                  {teamAwardTypes.map(award => (
                    <SelectItem key={award.id} value={award.id}>
                      {award.name} ({award.points} points)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Textarea
                placeholder="Reason for team award"
                value={newTeamAward.reason}
                onChange={(e) => setNewTeamAward(prev => ({ ...prev, reason: e.target.value }))}
              />
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetAwardDialog} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={createTeamAward} className="flex-1">
                  Create Award
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rankings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rankings">Team Rankings</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
          <TabsTrigger value="awards">Team Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Team Performance Rankings
              </CardTitle>
              <CardDescription>Teams ranked by overall performance from HR3 attendance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamRankings.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${getRankColor(team.rank)} text-white`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(team.rank)}
                        <span className="text-2xl font-bold">#{team.rank}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{team.name}</h3>
                        <p className="text-sm opacity-90">{team.member_count} team members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{team.overall_score}%</div>
                      <div className="text-sm opacity-90">Overall Score</div>
                      <Badge variant="secondary" className="mt-1">
                        {getTeamTotalPoints(team.id)} pts
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map(team => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription>{team.member_count} team members</CardDescription>
                    </div>
                    <Badge variant="secondary">{getTeamTotalPoints(team.id)} pts</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">{team.avg_attendance}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Avg Attendance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{team.avg_punctuality}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Avg Punctuality</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{team.avg_compliance}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Avg Compliance</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Consistency: {team.consistency_score}%</span>
                    <span>Trend: {team.improvement_trend > 0 ? '+' : ''}{team.improvement_trend}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {getTeamAwards(team.id).slice(0, 2).map(award => {
                      const awardType = teamAwardTypes.find(a => a.id === award.award_type)
                      const IconComponent = awardType?.icon || Award
                      return (
                        <Badge key={award.id} variant="outline" className="text-xs">
                          <IconComponent className="h-3 w-3 mr-1" />
                          {awardType?.name}
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="awards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Awards</CardTitle>
              <CardDescription>Awards based on team performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamAwards.map(award => {
                  const awardType = teamAwardTypes.find(a => a.id === award.award_type)
                  const IconComponent = awardType?.icon || Award
                  return (
                    <div key={award.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-6 w-6 ${awardType?.color || 'text-gray-600'}`} />
                        <div>
                          <div className="font-medium">{award.team_name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{award.award_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{award.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-400">+{award.points} pts</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{award.date_awarded}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
