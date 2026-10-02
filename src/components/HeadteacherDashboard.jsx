import { useState } from 'react'

function generateSchoolBasedPassword(schoolName, teacherName) {
  const s = (schoolName||'SCH').trim()
  const code = s.split(' ').filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,3) || 'SCH'
  const first = (teacherName||'Teach').split(' ')[0]||'Teach'
  const fn = first.slice(0,4).toLowerCase()
  const year = new Date().getFullYear().toString().slice(-2)
  const rand = Math.floor(10 + Math.random()*89)
  return `${code}${fn}${year}${rand}`
}

export default function HeadteacherDashboard({ classes=[], setClasses, teachers=[], setTeachers, onBack, setPage }) {
  const [view, setView] = useState('schoolList')

  const activeSchoolName = classes[0]?.school || teachers[0]?.school || 'My School'

  if(view==='schoolList'){
    return (
      <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:20}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 18px', borderRadius:100, border:'none', fontWeight:'700'}}>‹ Dashboard</button>
          <h1 style={{marginTop:20, fontWeight:'900', fontSize:22}}>Good Morning 👋 Headmaster</h1>
          <p style={{color:'#94A3B8', fontSize:12}}>1 registered school — tap to manage</p>
          <div onClick={()=>setView('schoolDetail')} style={{marginTop:24, background:'linear-gradient(135deg,#1E293B,#0F172A)', border:'2px solid #F59E0B', borderRadius:24, padding:28, cursor:'pointer', display:'flex', justifyContent:'space-between'}}>
            <div><div style={{fontSize:10, color:'#FBBF24', fontWeight:'900'}}>REGISTERED SCHOOL • TAP TO OPEN</div><div style={{fontSize:26, fontWeight:'900', marginTop:8}}>{activeSchoolName}</div><div style={{fontSize:12, color:'#94A3B8', marginTop:6}}>{classes.length} Classes • {teachers.length} Staff • →</div></div>
            <div style={{width:60, height:60, background:'#F59E0B', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28}}>🏫</div>
          </div>
        </div>
      </div>
    )
  }

  // SCHOOL DETAIL - WITH 7 CARDS NOW INCLUDING WORK OUTPUT
  const card = {background:'#151E32', border:'1px solid #23304D', borderRadius:20, padding:20, cursor:'pointer', height:140, display:'flex', flexDirection:'column', justifyContent:'space-between'}
  const go = (p)=> setPage(p)

  return (
    <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:20}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <button onClick={()=>setView('schoolList')} style={{background:'#1E293B', color:'white', border:'1px solid #2A3552', padding:'8px 18px', borderRadius:100}}>‹ {activeSchoolName}</button>
          <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 18px', borderRadius:100, border:'none', fontWeight:'700'}}>Dashboard</button>
        </div>
        <h2 style={{marginTop:18, fontWeight:'900'}}>{activeSchoolName} — Management</h2>
        <div style={{marginTop:18, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:14}}>

          {/* 1 - CLASSES */}
          <div onClick={()=>{ const c=prompt('New class e.g. JHS1, 5A:'); if(c&&c.trim()){ setClasses([...classes, {id:Date.now(), name:c.trim().toUpperCase(), school:activeSchoolName, level:`CLASS ${c.trim().toUpperCase()}`}]) }}} style={{...card, border:'1px solid #3B82F6'}}>
            <div style={{fontSize:26}}>🏫</div>
            <div><div style={{fontWeight:'800'}}>Classes</div><div style={{fontSize:11, color:'#93C5FD'}}>{classes.length} classes • Add</div></div>
          </div>

          {/* 2 - ADD STAFF */}
          <div onClick={()=>setPage('teachers')} style={{...card, border:'1px solid #10B981'}}>
            <div style={{fontSize:26}}>👨‍🏫</div>
            <div><div style={{fontWeight:'800'}}>Add Staff</div><div style={{fontSize:11, color:'#A7F3D0'}}>{teachers.length} staff</div></div>
          </div>

          {/* 3 - SCHOOL SETTINGS */}
          <div onClick={()=>go('schoolsettings')} style={card}>
            <div style={{fontSize:26}}>⚙️</div>
            <div><div style={{fontWeight:'800'}}>School Settings</div><div style={{fontSize:11, color:'#94A3B8'}}>Logo • Motto</div></div>
          </div>

          {/* 4 - LEVY MANAGEMENT */}
          <div onClick={()=>go('levy-master')} style={{...card, border:'1px solid #F59E0B'}}>
            <div style={{fontSize:26}}>💰</div>
            <div><div style={{fontWeight:'800'}}>Levy Management</div><div style={{fontSize:11, color:'#FDE68A'}}>Create PTA • Head only</div></div>
          </div>

          {/* 5 - BROADSHEET */}
          <div onClick={()=>go('broadsheet')} style={{...card, border:'1px solid #F59E0B', background:'linear-gradient(135deg,#151E32,#422006)'}}>
            <div style={{fontSize:26}}>📋</div>
            <div><div style={{fontWeight:'800'}}>Print BroadSheet</div><div style={{fontSize:11, color:'#FDE68A'}}>All classes • PDF</div></div>
          </div>

          {/* 6 - LESSON NOTES */}
          <div onClick={()=>go('lesson-notes')} style={{...card, border:'2px solid #22C55E', background:'#052E16'}}>
            <div style={{fontSize:26}}>📝</div>
            <div><div style={{fontWeight:'800'}}>Lesson Notes</div><div style={{fontSize:11, color:'#86EFAC'}}>15 Weeks • ✅ ✕ O • Head only</div><div style={{fontSize:8, background:'#22C55E', color:'black', padding:'2px 6px', borderRadius:100, fontWeight:'900', display:'inline-block', marginTop:4}}>GES FORM</div></div>
          </div>

          {/* 7 - WORK OUTPUT CHART - NEW - EDITABLE NUMBERS */}
          <div onClick={()=>go('work-output')} style={{...card, border:'2px solid #3B82F6', background:'#1E293B'}}>
            <div style={{fontSize:26}}>📊</div>
            <div><div style={{fontWeight:'800'}}>Work Output Chart</div><div style={{fontSize:11, color:'#93C5FD'}}>Exercises per week • Editable numbers</div><div style={{fontSize:8, background:'#3B82F6', color:'white', padding:'2px 6px', borderRadius:100, fontWeight:'900', display:'inline-block', marginTop:4}}>GES FORM - EDITABLE</div></div>
          </div>

        </div>
      </div>
    </div>
  )
}