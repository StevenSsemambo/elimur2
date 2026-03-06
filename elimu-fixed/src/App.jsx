import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './context/UserContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SubjectThemeProvider } from './context/SubjectThemeContext.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import OfflineIndicator from './components/OfflineIndicator.jsx'
import Welcome from './pages/Welcome.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SubjectHome from './pages/SubjectHome.jsx'
import TopicList from './pages/TopicList.jsx'
import Lesson from './pages/Lesson.jsx'
import Quiz from './pages/Quiz.jsx'
import Results from './pages/Results.jsx'
import Progress from './pages/Progress.jsx'
import Settings from './pages/Settings.jsx'
import Search from './pages/Search.jsx'
import Bookmarks from './pages/Bookmarks.jsx'
import Achievements from './pages/Achievements.jsx'
import QuickQuiz from './pages/QuickQuiz.jsx'
import FocusTimer from './pages/FocusTimer.jsx'
import Leaderboard from './pages/Leaderboard.jsx'

function AppRoutes() {
  const { student, loading } = useUser()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0F1A' }}>
      <div className="text-center">
        <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: '#F59E0B', borderTopColor: 'transparent' }} />
        <p className="text-slate-500 text-sm">Loading Elimu Learn...</p>
      </div>
    </div>
  )

  const guard = el => student ? el : <Navigate to="/" replace />
  return (
    <>
      <OfflineIndicator />
      <Routes>
        <Route path="/"                                element={student ? <Navigate to="/dashboard" replace /> : <Welcome />} />
        <Route path="/dashboard"                       element={guard(<Dashboard />)} />
        <Route path="/subject/:subject"                element={guard(<SubjectHome />)} />
        <Route path="/subject/:subject/topic/:topicId" element={guard(<TopicList />)} />
        <Route path="/lesson/:lessonId"                element={guard(<Lesson />)} />
        <Route path="/quiz/:lessonId"                  element={guard(<Quiz />)} />
        <Route path="/results/:lessonId"               element={guard(<Results />)} />
        <Route path="/progress"                        element={guard(<Progress />)} />
        <Route path="/settings"                        element={guard(<Settings />)} />
        <Route path="/search"                          element={guard(<Search />)} />
        <Route path="/bookmarks"                       element={guard(<Bookmarks />)} />
        <Route path="/achievements"                    element={guard(<Achievements />)} />
        <Route path="/quick-quiz"                      element={guard(<QuickQuiz />)} />
        <Route path="/focus-timer"                     element={guard(<FocusTimer />)} />
        <Route path="/leaderboard"                     element={guard(<Leaderboard />)} />
        <Route path="*"                                element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const hasStudent = !!localStorage.getItem('elimu_student_id')

  return (
    <ThemeProvider>
      <SubjectThemeProvider>
        <UserProvider>
          <BrowserRouter>
            {!splashDone && !hasStudent && <SplashScreen onDone={() => setSplashDone(true)} />}
            {(splashDone || hasStudent) && <AppRoutes />}
          </BrowserRouter>
        </UserProvider>
      </SubjectThemeProvider>
    </ThemeProvider>
  )
}
