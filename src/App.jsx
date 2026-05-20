import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AnimatedBackground from './components/AnimatedBackground'
import LightBackground from './components/LightBackground'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Games from './pages/Games'
import Play from './pages/Play'
import Stats from './pages/Stats'
import Admin from './pages/Admin'
import ResetPassword from './pages/ResetPassword'

// Оборачивает маршрут для обычных пользователей – админа редиректит в /admin
function UserRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return null
  if (isAdmin) return <Navigate to="/admin" replace />
  return children
}

// Оборачивает маршрут для администратора – не-админа редиректит в /
function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AppContent() {
  const location = useLocation()
  const isDark =
    location.pathname === '/' ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/reset-password')

  return (
    <div className="min-h-screen">
      {isDark ? <AnimatedBackground /> : <LightBackground />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <Dashboard />
            </UserRoute>
          }
        />
        <Route
          path="/games/:childId"
          element={
            <UserRoute>
              <Games />
            </UserRoute>
          }
        />
        <Route
          path="/play/:childId/:gameId"
          element={
            <UserRoute>
              <Play />
            </UserRoute>
          }
        />
        <Route
          path="/stats/:childId"
          element={
            <UserRoute>
              <Stats />
            </UserRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  )
}