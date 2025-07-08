import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import AdminPanel from './components/admin/AdminPanel'
import TestPage from './TestPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/test" element={<TestPage />} />
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  )
}

export default App 