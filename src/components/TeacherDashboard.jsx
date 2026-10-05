import { useState } from 'react'
import MasterSheet from './MasterSheet'
import ClassAnnouncementView from '../components/ClassAnnouncementView'

export default function TeacherDashboard({ onBack }){
  const [showMaster, setShowMaster] = useState(false)

  let teacherClass = '5A'
  try{
    const t = JSON.parse(localStorage.getItem('currentTeacher')||'null')
    if(t?.assignedClass) teacherClass = t.assignedClass
    else teacherClass = localStorage.getItem('teacher_class') || '5A'
  }catch{}

  if(showMaster) return <MasterSheet onBack={()=>setShowMaster(false)} currentTeacherClass={teacherClass} />

  return (
    <div style={{minHeight:'100vh', background:'#0A0F1E', color:'white', padding:16}}>
      <div style={{maxWidth:600, margin:'0 auto', marginTop:20}}>
        <button onClick={onBack} style={{width:40,height:40,borderRadius:12,background:'#1A2236',border:'1px solid #2A3552',color:'white'}}>‹</button>

        <div style={{marginTop:16}}>
          <ClassAnnouncementView />
        </div>

        <div style={{marginTop:10, background:'#151A2E', border:'1px solid #1E293B', borderRadius:20, padding:20, textAlign:'center'}}>
          <div style={{fontSize:50}}>Teacher</div>
          <div style={{fontWeight:'800', fontSize:22, marginTop:10}}>Teacher Panel - Class {teacherClass}</div>
          <div style={{fontSize:12, color:'#94A3B8', marginTop:6}}>Print your class Master Sheet to submit to Headteacher</div>

          <button onClick={()=>setShowMaster(true)} style={{width:'100%', marginTop:20, background:'#F59E0B', color:'black', padding:18, borderRadius:16, border:'none', fontWeight:'800', fontSize:16}}>
            Open Master Sheet - Class {teacherClass}
          </button>
        </div>
      </div>
    </div>
  )
}