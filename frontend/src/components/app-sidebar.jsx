import {
  Car,
  Command,
  Calendar,
  FileText,
  Tag,
  BookOpen,
  LifeBuoy,
  PieChartIcon,
  Send,
  WrenchIcon,
  BookOpenCheckIcon,
  Gauge,
  ChartSpline,
  User,
  TagsIcon,
  HistoryIcon,
  LogsIcon,
  MapPinIcon,
  GlobeIcon
} from "lucide-react"

import { Link } from 'react-router'
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Skeleton } from '@/components/ui/skeleton'

import AuthContext from "../context/AuthProvider"
import { useContext } from "react"

import logo from '@/assets/joli_cropped.png'
const data = {

  HR1Nav: [
    {
      NavGroup: {
        NavLabel: 'Analytics',
        NavItems: [
          { title: "Dashboard", url: '/', icon: Gauge },
        ],
      },
    },
    {
      NavGroup: {
        NavLabel: 'Applicant Management',
        NavItems: [
          { title: "Applicant List", url: '/applicant', icon: User },
          { title: "Interview Scheduling", url: '/interview', icon: Calendar },
        ],
      },
    },
    {
      NavGroup: {
        NavLabel: 'Recruitment Management',
        NavItems: [
          { title: "Job Postings", url: '/jobposting', icon: FileText },
          { title: "Offer Management", url: '/offermanagement', icon: Tag },
        ],
      },
    },
    {
      NavGroup: {
        NavLabel: 'New Hire Onboarding',
        NavItems: [
          { title: "Onboarding Checklist", url: '/onboarding', icon: BookOpen },
          { title: "Hired Employees", url: '/hired-employees', icon: User },
        ],
      },
    },
    {
      NavGroup: {
        NavLabel: 'Initial Performance Management',
        NavItems: [
          { title: "Performance Reviews", url: '/performance', icon: BookOpen },
          { title: "Feedback & Coaching", url: '/feedback', icon: LifeBuoy },
        ],
      },
    },
    {
      NavGroup: {
        NavLabel: 'Social Recognition',
        NavItems: [
          { title: "Awards & Badges", url: '/recognition', icon: Tag },
        ],
      },
    },
  ],

  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  
}

export function AppSidebar({...props}) {
  const { auth, logout, loading } = useContext(AuthContext)
  const user = {
    name: auth?.name,
    role: auth?.role,
    avatar: null,
    email: auth?.email
  }

  return (
    <Sidebar collapsible="icon" {...props} className="rounded-md">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>            
            <Link to="/" className="flex justify-center">
              <img src={logo} className="h-10  object-scale-down" alt=""/>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2">
        
        {loading ? (
            // Skeleton Placeholder while loading
            <div className="flex flex-col gap-2 px-2 h-full">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="flex-1 w-full" />
              <Skeleton className="flex-1 w-full" />
            </div>
          ) : (
            <>
              {user.role === "HR1 Admin" ? 
              (<NavMain data={data.HR1Nav}/>) 
              : null}
            </>
          )
        }
      </SidebarContent>
      <SidebarRail/>
      <SidebarFooter>
        {loading ? 
          (<Skeleton className="w-full h-full"/>) : (<NavUser user={user} logout={logout} />)
        }
      </SidebarFooter>
    </Sidebar>
  );
}
