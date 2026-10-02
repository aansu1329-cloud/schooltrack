import { useState } from 'react'
import MasterSheet from './MasterSheet'

export default function TeacherDashboard({ onBack }){
  const [show, setShow] = useState(false)
  const teacher = JSON.parse(localStorage.getItem('currentTeacher')||'{}')
  const myClass = teacher.assignedClass || localStorage.getItem('teacher_class') || '5A'

  if(show) return <MasterSheet onBack={()=>setShow(false)} currentTeacherClass={myClass} />

  return (
    <div style={{minHeight:'100vh', background:'#0A0F1E', color:'white', padding:20}}>
      <button onClick={onBack} style={{width:40,height:40,borderRadius:12,background:'#1A2236',color:'white',border:'1px solid #2A3552'}}>‹</button>
      <div style={{maxWidth:500, margin:'40px auto', background:'#151A2E', padding:20, borderRadius:20, textAlign:'center', border:'1px solid #1E293B'}}>
        <div style={{fontSize:50}}>👨‍🏫</div>
        <div style={{fontWeight:800, fontSize:20, marginTop:10}}>Class {myClass} Teacher Panel</div>
        <button onClick={()=>setShow(true)} style={{width:'100%', marginTop:20, background:'#F59E0B', color:'black', padding:16, borderRadius:14, border:'none', fontWeight:800, fontSize:16}}>📊 Open My Master Sheet - Class {myClass}</button>
        <div style={{fontSize:11, color:'#94A3B8', marginTop:10}}>This will show ONLY {myClass} learners and ONLY your selected subjects (3 subjects) then you print to Headteacher</div>
      </div>
    </div>
  )
}