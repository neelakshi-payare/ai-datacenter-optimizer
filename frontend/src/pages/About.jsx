export default function About() {
  return (
    <div>
      <h1 style={{fontSize:'1.8rem', fontWeight:700, marginBottom:'0.5rem'}}>
        📄 About This Project
      </h1>
      <p style={{color:'#94a3b8', marginBottom:'2rem'}}>
        Research-backed AI system for data center energy optimization
      </p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
        {/* Research Paper */}
        <div style={{background:'#1e293b', borderRadius:'12px', padding:'1.5rem'}}>
          <h3 style={{color:'#3b82f6', marginBottom:'1rem'}}>📑 Research Paper</h3>
          <p style={{color:'#94a3b8', lineHeight:1.7}}>
            This project is based on the research paper:<br/><br/>
            <strong style={{color:'#e2e8f0'}}>
              "Optimizing Data Center Energy Consumption Through AI-Based Workload Scheduling"
            </strong>
            <br/><br/>
            The paper evaluates ML, RL, DQN, and Hybrid AI models
            for energy-efficient workload scheduling in large-scale data centers.
          </p>
        </div>

        {/* Models Used */}
        <div style={{background:'#1e293b', borderRadius:'12px', padding:'1.5rem'}}>
          <h3 style={{color:'#3b82f6', marginBottom:'1rem'}}>🤖 AI Models Used</h3>
          {[
            { name:'Machine Learning (ML)',          color:'#f59e0b', desc:'Random Forest baseline' },
            { name:'Reinforcement Learning (RL)',     color:'#10b981', desc:'A2C adaptive scheduler' },
            { name:'Deep Q-Network (DQN)',            color:'#6366f1', desc:'Best single model' },
            { name:'Hybrid (DRL + EA)',               color:'#3b82f6', desc:'🏆 Best overall performance' },
          ].map(m => (
            <div key={m.name} style={{display:'flex', alignItems:'center',
              gap:'0.8rem', marginBottom:'0.8rem'}}>
              <div style={{width:12, height:12, borderRadius:'50%', background:m.color}}/>
              <div>
                <div style={{fontWeight:600, color:m.color}}>{m.name}</div>
                <div style={{fontSize:'0.8rem', color:'#94a3b8'}}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div style={{background:'#1e293b', borderRadius:'12px', padding:'1.5rem'}}>
          <h3 style={{color:'#3b82f6', marginBottom:'1rem'}}>🛠️ Tech Stack</h3>
          {[
            { layer:'Frontend',   tech:'React + Vite + Recharts' },
            { layer:'Backend',    tech:'Python Flask REST API' },
            { layer:'Simulation', tech:'SimPy Data Center Simulator' },
            { layer:'AI Models',  tech:'ML, RL, DQN, Hybrid AI' },
            { layer:'Dataset',    tech:'Data Centres Worldwide' },
          ].map(t => (
            <div key={t.layer} style={{display:'flex', justifyContent:'space-between',
              padding:'0.5rem 0', borderBottom:'1px solid #334155'}}>
              <span style={{color:'#94a3b8'}}>{t.layer}</span>
              <span style={{color:'#e2e8f0', fontWeight:500}}>{t.tech}</span>
            </div>
          ))}
        </div>

        {/* Key Results */}
        <div style={{background:'#1e293b', borderRadius:'12px', padding:'1.5rem'}}>
          <h3 style={{color:'#3b82f6', marginBottom:'1rem'}}>📈 Key Results</h3>
          {[
            { metric:'Energy Reduction',   value:'18-22%',  color:'#3b82f6' },
            { metric:'Best Model',         value:'Hybrid',  color:'#10b981' },
            { metric:'SLA Compliance',     value:'96.2%',   color:'#f59e0b' },
            { metric:'Simulation Runs',    value:'30',      color:'#6366f1' },
          ].map(r => (
            <div key={r.metric} style={{display:'flex', justifyContent:'space-between',
              padding:'0.5rem 0', borderBottom:'1px solid #334155'}}>
              <span style={{color:'#94a3b8'}}>{r.metric}</span>
              <span style={{fontWeight:700, color:r.color}}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}