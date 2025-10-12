import { createContext, useState, useEffect } from "react";
import api, { login as apiLogin, logout as apiLogout } from "../api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const AuthContext = createContext({})
export const AuthProvider = ({ children }) => {
  const env = import.meta.env.VITE_AUTH_BACKEND
  //console.log("AuthProvider using backend: " + env)
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // always fetch user from backend if cookie exists
  const fetchUser = async () => {
    try {
      const response = await api.get("/api/user", { withCredentials: true })
      setAuth(response.data)
      return response.data
    } catch (error) {
      setAuth(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (credentials) => {
    try {
      await apiLogin(credentials) // cookie set
      const user = await fetchUser() // now fetch actual user object

      if (user) {
        toast.success('Login successful, redirecting...', { position: "top-center" })
        roleAccess(user, navigate)
      } else {
        toast.error('Login failed: unable to fetch user', { position: "top-center" })
      }
    } catch (error) {
      if (error.response) {
        if ([401, 422].includes(error.response.status)) {
          toast.error('Invalid credentials', { position: "top-center" })
        } else if (error.response.status === 500) {
          toast.error('Server error. Please try again later.', { position: "top-center" })
        } else {
          toast.error(`Login failed (${error.response.status})`, { position: "top-center" })
        }
      } else {
        toast.error('Network error. Please check your connection.', { position: "top-center" })
      }
      console.error(error)
    }
  }

  const roleAccess = (user, navigate) => {
    switch (user?.role) {
      case 'Super Admin':
        navigate('/login')
        break
      case 'LogisticsII Admin':
      case 'Driver':
      case 'Employee':
        navigate('/logisticsII/')
        break
      case 'LogisticsI Admin':
        navigate('/logistics1/')
        break
      case 'HR1 Admin':
        navigate('/hr1/')
        break
      default:
        navigate('/login')
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (_) {
      // ignore errors
    } finally {
      setAuth(null)
      navigate('/login')
    }
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, loading, roleAccess, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
