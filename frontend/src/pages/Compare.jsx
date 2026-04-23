import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Compare() {
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    axios.get('https://ai-datacenter-optimizer-production.up.railway.app/compare')
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => { setError('❌ Cannot connect to backend!'); setLoading(false) })
  }, [])

  const chartData = data.map(d => ({
    model:  d.model,
    Energy: d.total_energy_kwh,
    SLA:    d.sla_compliance,
    Time:   d.avg_completion_time,
  }))

  return (
    <div>
      <h1 style={{fontSize:'1.8rem', fontWeight:700, marginBottom:'0.5rem'}}>
        📊 Model Comparison
      </h1>
      <p style={{color:'#94a3b8', marginBottom:'2rem'}}>
        Side-by-side comparison of all 4 AI scheduling models
      </p>

      {loading && <div style={{color:'#94a3b8', textAlign:'center', padding:'3rem'}}>
        ⏳ Loading comparison data...
      </div>}

      {error && <div style={{background:'#450a0a', color:'#fca5a5',
        padding:'1rem', borderRadius:'8px'}}>{error}</div>}

      {!loading && !error && (
        <>
          {/* Table */}
          <div style={{background:'#1e293b', borderRadius:'12px',
            padding:'1.5rem', marginBottom:'1.5rem', overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'2px solid #334155'}}>
                  {['Model','Energy (kWh)','Tasks Done','SLA %','Avg Time (s)'].map(h => (
                    <th key={h} style={{padding:'0.8rem', textAlign:'left', color:'#94a3b8'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} style={{borderBottom:'1px solid #334155',
                    background: d.model === 'HYBRID' ? '#1e3a5f' : 'transparent'}}>
                    <td style={{padding:'0.8rem', fontWeight:700, color:
                      d.model==='HYBRID'?'#3b82f6':d.model==='DQN'?'#6366f1':
                      d.model==='RL'?'#10b981':'#f59e0b'}}>
                      {d.model === 'HYBRID' ? '🏆 ' : ''}{d.model}
                    </td>
                    <td style={{padding:'0.8rem'}}>{d.total_energy_kwh}</td>
                    <td style={{padding:'0.8rem'}}>{d.tasks_completed}</td>
                    <td style={{padding:'0.8rem'}}>{d.sla_compliance}%</td>
                    <td style={{padding:'0.8rem'}}>{d.avg_completion_time}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar Chart */}
          <div style={{background:'#1e293b', borderRadius:'12px', padding:'1.5rem'}}>
            <h3 style={{marginBottom:'1rem'}}>⚡ Energy Consumption by Model</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="model" stroke="#94a3b8"/>
                <YAxis stroke="#94a3b8"/>
                <Tooltip contentStyle={{background:'#1e293b', border:'1px solid #3b82f6'}}/>
                <Bar dataKey="Energy" fill="#3b82f6" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}