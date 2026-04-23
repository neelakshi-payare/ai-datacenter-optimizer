import { useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Dashboard() {
  const [model, setModel]       = useState('hybrid')
  const [tasks, setTasks]       = useState(100)
  const [servers, setServers]   = useState(10)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const models = [
    { id: 'ml',     label: 'ML',     color: '#f59e0b' },
    { id: 'rl',     label: 'RL',     color: '#10b981' },
    { id: 'DL',    label: 'DL',    color: '#6366f1' },
    { id: 'hybrid', label: 'Hybrid', color: '#3b82f6' },
  ]

  const runSimulation = async () => {
    setLoading(true)
    setError(null)
    try {
      const seed = model + '_' + tasks + '_' + servers
const res = await axios.post('https://ai-datacenter-optimizer-production.up.railway.app/simulate', {
  model, num_tasks: tasks, num_servers: servers, seed
})
      
      setResult(res.data)
    } catch {
      setError('❌ Cannot connect to backend. Make sure Flask is running!')
    } finally {
      setLoading(false)
    }
  }

  const energyData = result?.energy_log?.map((v, i) => ({ task: i + 1, energy: v })) || []

  return (
    <div>
      <h1 style={{fontSize:'1.8rem', fontWeight:700, marginBottom:'0.5rem'}}>
        ⚡ Simulation Dashboard
      </h1>
      <p style={{color:'#94a3b8', marginBottom:'2rem'}}>
        Select an AI model and run the data center simulation
      </p>

      {/* Model Selection */}
      <div style={{background:'#1e293b', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem'}}>
        <h3 style={{marginBottom:'1rem', color:'#94a3b8'}}>Select AI Model</h3>
        <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
          {models.map(m => (
            <button key={m.id} onClick={() => setModel(m.id)} style={{
              padding:'0.6rem 1.5rem', borderRadius:'8px', border:'2px solid',
              borderColor: model === m.id ? m.color : '#334155',
              background: model === m.id ? m.color + '22' : 'transparent',
              color: model === m.id ? m.color : '#94a3b8',
              fontWeight: 600, cursor:'pointer', fontSize:'1rem', transition:'all 0.2s'
            }}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div style={{background:'#1e293b', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem'}}>
        <h3 style={{marginBottom:'1rem', color:'#94a3b8'}}>Simulation Parameters</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
          <div>
            <label style={{color:'#e2e8f0'}}>Number of Tasks: <strong style={{color:'#3b82f6'}}>{tasks}</strong></label>
            <input type="range" min="10" max="500" value={tasks}
              onChange={e => setTasks(Number(e.target.value))}
              style={{width:'100%', marginTop:'0.5rem', accentColor:'#3b82f6'}}/>
          </div>
          <div>
            <label style={{color:'#e2e8f0'}}>Number of Servers: <strong style={{color:'#3b82f6'}}>{servers}</strong></label>
            <input type="range" min="1" max="50" value={servers}
              onChange={e => setServers(Number(e.target.value))}
              style={{width:'100%', marginTop:'0.5rem', accentColor:'#3b82f6'}}/>
          </div>
        </div>
      </div>

      {/* Run Button */}
      <button onClick={runSimulation} disabled={loading} style={{
        width:'100%', padding:'1rem', fontSize:'1.1rem', fontWeight:700,
        background: loading ? '#334155' : '#3b82f6', color:'#fff',
        border:'none', borderRadius:'10px', cursor: loading ? 'not-allowed' : 'pointer',
        marginBottom:'1.5rem', transition:'all 0.2s'
      }}>
        {loading ? '⏳ Running Simulation...' : '▶ Run Simulation'}
      </button>

      {/* Error */}
      {error && <div style={{background:'#450a0a', color:'#fca5a5', padding:'1rem',
        borderRadius:'8px', marginBottom:'1rem'}}>{error}</div>}

      {/* Results */}
      {result && (
        <div>
          {/* Metric Cards */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem'}}>
            {[
              { label:'⚡ Energy Used',     value: result.total_energy_kwh + ' kWh', color:'#f59e0b' },
              { label:'✅ Tasks Completed', value: result.tasks_completed,            color:'#10b981' },
              { label:'⏱️ Avg Time',        value: result.avg_completion_time + 's',  color:'#6366f1' },
              { label:'📋 SLA Compliance',  value: result.sla_compliance + '%',       color:'#3b82f6' },
            ].map(card => (
              <div key={card.label} style={{background:'#1e293b', borderRadius:'10px',
                padding:'1.2rem', borderTop:`3px solid ${card.color}`}}>
                <div style={{color:'#94a3b8', fontSize:'0.85rem', marginBottom:'0.4rem'}}>{card.label}</div>
                <div style={{fontSize:'1.5rem', fontWeight:700, color:card.color}}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Energy Log Chart */}
          <div style={{background:'#1e293b', borderRadius:'12px', padding:'1.5rem'}}>
            <h3 style={{marginBottom:'1rem'}}>📈 Energy Usage Per Task</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="task" stroke="#94a3b8" label={{value:'Task #', position:'insideBottom', offset:-2, fill:'#94a3b8'}}/>
                <YAxis stroke="#94a3b8"/>
                <Tooltip contentStyle={{background:'#1e293b', border:'1px solid #3b82f6'}}/>
                <Line type="monotone" dataKey="energy" stroke="#3b82f6" dot={false} strokeWidth={2}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}