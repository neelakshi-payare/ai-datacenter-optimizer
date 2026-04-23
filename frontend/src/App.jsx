import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Compare from './pages/Compare'
import ResourceMonitor from './pages/ResourceMonitor'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            🔋 AI Data Center Energy Optimizer
          </div>
          <div className="nav-links">
            <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
            <NavLink to="/compare" className={({isActive}) => isActive ? 'active' : ''}>Compare Models</NavLink>
            <NavLink to="/resources" className={({isActive}) => isActive ? 'active' : ''}>Resources</NavLink>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/resources" element={<ResourceMonitor />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App