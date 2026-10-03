import { useState, useEffect } from 'react'
import TeacherManagement from "./components/TeachersManagement.jsx"
import ClassAssessments from './pages/ClassAssessments.jsx'
import { allSubjectsList } from './data/mockData.js'
import { getActiveSchoolId, getKey, getClassKeyVersioned } from './utils/storage.js'
import { loginUser, logoutUser, registerSchool, registerIndividual } from './utils/auth.js'
import AttendanceRegister from './components/AttendanceRegister'
import HeadteacherDashboard from './components/HeadteacherDashboard'
import SchoolSettings from './components/SchoolSettings.jsx'
import TerminalReport from './components/TerminalReport.jsx'
import MasterSheet from "./components/MasterSheet.jsx"
import TeacherInfo from './components/TeacherInfo.jsx'
import LevyMaster from "./components/LevyMaster.jsx"
import LevyCollector from "./components/LevyCollector.jsx"
import LessonNoteSubmission from "./components/LessonNoteSubmission.jsx"
import WorkOutputChart from './components/WorkOutputChart.jsx'

export default function App(){
  const [page, setPage] = useState('dashboard')
  const [firstName, setFirstName] = useState('')
  const [otherNames, setOtherNames] = useState('')
  const [gender, setGender] = useState('Boy')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('Current')
  const [actionMenuId, setActionMenuId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [studentPhoto, setStudentPhoto] = useState('')

  const [authMode, setAuthMode] = useState('login')
  const [loginSchoolCode, setLoginSchoolCode] = useState('')
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('')

  const [regSchoolName, setRegSchoolName] = useState('')
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regHeadName, setRegHeadName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regSchoolCode, setRegSchoolCode] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regIndName, setRegIndName] = useState('')
  const [regIndEmail, setRegIndEmail] = useState('')
  const [regIndPassword, setRegIndPassword] = useState('')
  const [regIndPhone, setRegIndPhone] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [schoolCodeError, setSchoolCodeError] = useState('')

  const [currentUser, setCurrentUser] = useState(()=>{
    try{ const s=localStorage.getItem('currentUser_v3'); return s? JSON.parse(s): null }catch{ return null }
  })

  const [classes, setClasses] = useState(()=>{
    try{
      const sid = getActiveSchoolId()
      if(sid){
        const s=localStorage.getItem(`${sid}_my_classes`);
        return s? JSON.parse(s) : []
      }
      return []
    }catch{ return [] }
  })
  const [activeClass, setActiveClass] = useState(()=>{
    try{
      const sid = getActiveSchoolId()
      if(sid){
        const s=localStorage.getItem(`${sid}_my_classes`);
        const arr = s? JSON.parse(s) : []
        return arr[0] || null
      }
      return null
    }catch{ return null }
  })
  const [selectedSubs, setSelectedSubs] = useState(()=>{
    try{
      const sid = getActiveSchoolId()
      if(!sid) return []
      const ac = classes[0]?.name
      if(!ac) return []
      const s=localStorage.getItem(`${sid}_selectedSubs_${ac}_v1`) || localStorage.getItem(`${sid}_selectedSubs_${ac}`);
      return s? JSON.parse(s) : []
    }catch{ return [] }
  })
  const [tempSubs, setTempSubs] = useState(selectedSubs)
  const [students, setStudents] = useState(()=>{
    try{
      const sid = getActiveSchoolId()
      if(!sid) return []
      const ac = classes[0]?.name
      if(!ac) return []
      const s=localStorage.getItem(`${sid}_students_${ac}_v2`);
      return s? JSON.parse(s) : []
    }catch{ return [] }
  })
  const [teachers, setTeachers] = useState(()=>{
    try{
      const sid = getActiveSchoolId()
      if(sid){
        const s=localStorage.getItem(`${sid}_teachers`);
        return s? JSON.parse(s) : []
      }
      return []
    }catch{ return [] }
  })

  useEffect(()=> { if(getActiveSchoolId()) localStorage.setItem(getKey('my_classes'), JSON.stringify(classes)) }, [classes])
  useEffect(()=> { if(getActiveSchoolId()) localStorage.setItem(getKey('teachers'), JSON.stringify(teachers)) }, [teachers])
  useEffect(()=> { if(activeClass) localStorage.setItem(getClassKeyVersioned(activeClass.name, 'students', 'v2'), JSON.stringify(students)) }, [students, activeClass])
  useEffect(()=> { if(activeClass) localStorage.setItem(getClassKeyVersioned(activeClass.name, 'selectedSubs', 'v1'), JSON.stringify(selectedSubs)) }, [selectedSubs, activeClass])
  useEffect(()=>{ if(page==='subjects') setTempSubs(selectedSubs) }, [page])
  useEffect(()=>{ if(currentUser) localStorage.setItem('currentUser_v3', JSON.stringify(currentUser)) }, [currentUser])

  useEffect(()=>{
    const sid = getActiveSchoolId()
    if(!sid ||!activeClass) return
    try{
      const s=localStorage.getItem(`${sid}_students_${activeClass.name}_v2`)
      setStudents(s? JSON.parse(s) : [])
      const sub=localStorage.getItem(`${sid}_selectedSubs_${activeClass.name}_v1`) || localStorage.getItem(`${sid}_selectedSubs_${activeClass.name}`)
      if(sub) setSelectedSubs(JSON.parse(sub))
      else setSelectedSubs([])
    }catch{}
  }, [activeClass])

  const getAllSchoolCodes = ()=>{
    try{
      const s = localStorage.getItem('all_school_codes_registry_v1')
      return s? JSON.parse(s) : []
    }catch{ return [] }
  }
  const isSchoolCodeTaken = (code)=>{
    try{
      const all = getAllSchoolCodes()
      if(all.length===0) return false
      if(typeof all[0]==='string'){
        return all.map(c=>c.toUpperCase()).includes(code.trim().toUpperCase())
      }
      return all.some(r=> r.code && r.code.toUpperCase()===code.trim().toUpperCase())
    }catch{ return false }
  }

  const handleLogin_NEW = ()=>{
    const code = loginSchoolCode.trim().toUpperCase()
    const phone = loginPhone.trim()
    if(!code ||!phone ||!loginPassword){ alert('Please fill School Code, Phone and Password'); return }
    try{
      const registry = getAllSchoolCodes()
      let foundSchoolId = null
      if(registry.length>0 && typeof registry[0]!=='string'){
        const entry = registry.find(r=> r.code && r.code.toUpperCase()===code)
        if(entry) foundSchoolId=entry.schoolId
      }
      if(!foundSchoolId){
        for(let i=0;i<localStorage.length;i++){
          const k = localStorage.key(i)
          if(k && k.endsWith('_info')){
            try{
              const info = JSON.parse(localStorage.getItem(k)||'{}')
              if(info.schoolCode && info.schoolCode.toUpperCase()===code){
                foundSchoolId = k.replace('_info','')
                break
              }
            }catch{}
          }
        }
      }
      if(!foundSchoolId){ alert('School Code not found!'); return }
      const teachersStr = localStorage.getItem(`${foundSchoolId}_teachers`)
      const schoolTeachers = teachersStr? JSON.parse(teachersStr): []
      const user = schoolTeachers.find(t=> (t.phone||'').replace(/\s/g,'')===phone.replace(/\s/g,'') && (t.password||'')===loginPassword )
      if(!user){
        const userByEmail = schoolTeachers.find(t=> (t.email||'').toLowerCase()===phone.toLowerCase() && (t.password||'')===loginPassword)
        if(!userByEmail){ alert('Phone or Password incorrect for this School Code'); return }
        else {
          localStorage.setItem('activeSchoolId', foundSchoolId)
          setClasses(JSON.parse(localStorage.getItem(`${foundSchoolId}_my_classes`)||'[]'))
          setTeachers(schoolTeachers)
          setCurrentUser(userByEmail)
          setPage('dashboard')
          const ac = JSON.parse(localStorage.getItem(`${foundSchoolId}_my_classes`)||'[]')[0]||null
          setActiveClass(ac)
          return
        }
      }
      localStorage.setItem('activeSchoolId', foundSchoolId)
      setClasses(JSON.parse(localStorage.getItem(`${foundSchoolId}_my_classes`)||'[]'))
      setTeachers(schoolTeachers)
      setCurrentUser(user)
      const ac = JSON.parse(localStorage.getItem(`${foundSchoolId}_my_classes`)||'[]')[0]||null
      setActiveClass(ac)
      setPage('dashboard')
    }catch(e){
      const res = loginUser(loginEmail || phone, loginPassword)
      if(!res.success){ alert(res.message); return }
      const sid = getActiveSchoolId()
      try{
        const cls = localStorage.getItem(`${sid}_my_classes`)
        if(cls){ const c=JSON.parse(cls); setClasses(c); setActiveClass(c[0]||null) }
        const teach = localStorage.getItem(`${sid}_teachers`)
        if(teach) setTeachers(JSON.parse(teach))
      }catch{}
      setCurrentUser(res.user); setPage('dashboard')
    }
  }

  const handleLogout = ()=>{
    logoutUser()
    setCurrentUser(null); setLoginEmail(''); setLoginPassword(''); setLoginPhone(''); setLoginSchoolCode(''); setAuthMode('login'); setClasses([]); setStudents([]); setTeachers([]); setActiveClass(null); setSelectedSubs([])
  }

  const handleRegisterSchool_NEW = ()=>{
    const code = regSchoolCode.trim().toUpperCase()
    if(!regSchoolName ||!regFirstName ||!regLastName ||!regEmail ||!regPhone ||!code ||!regPassword ||!regConfirm){
      alert('Please fill all fields *'); return
    }
    if(regPassword.length<6){ alert('Password must be at least 6 chars'); return }
    if(regPassword!==regConfirm){ alert('Passwords do not match'); return }
    if(isSchoolCodeTaken(code)){
      setSchoolCodeError('This School Code already exists!')
      alert('This School Code already exists! Choose e.g. '+code+'2026')
      return
    }
    setSchoolCodeError('')
    const fullName = `${regFirstName} ${regLastName}`.trim()
    const schoolId = `SCH_${Date.now()}`
    const newUser = {
      id: `user_${Date.now()}`,
      name: fullName,
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail.toLowerCase(),
      phone: regPhone.trim(),
      password: regPassword,
      role: 'HEADTEACHER',
      school: regSchoolName,
      schoolId: schoolId,
      schoolCode: code
    }
    localStorage.setItem(`${schoolId}_info`, JSON.stringify({schoolName: regSchoolName, schoolCode: code, headName: fullName, email: regEmail}))
    localStorage.setItem(`${schoolId}_teachers`, JSON.stringify([newUser]))
    localStorage.setItem(`${schoolId}_my_classes`, JSON.stringify([{id:`class_${Date.now()}`, name:'Basic 1A', school: regSchoolName}]))
    localStorage.setItem('activeSchoolId', schoolId)
    const registry = getAllSchoolCodes()
    const newRegistry = Array.isArray(registry) && registry.length>0 && typeof registry[0]==='string'? [] : registry
    newRegistry.push({code: code, schoolId: schoolId, schoolName: regSchoolName})
    localStorage.setItem('all_school_codes_registry_v1', JSON.stringify(newRegistry))
    setTeachers([newUser])
    setClasses([{id:`class_${Date.now()}`, name:'Basic 1A', school: regSchoolName}])
    setActiveClass({id:`class_${Date.now()}`, name:'Basic 1A', school: regSchoolName})
    setCurrentUser(newUser)
    setPage('dashboard')
  }

  const handleRegisterIndividual = ()=>{
    const res = registerIndividual({ name: regIndName, email: regIndEmail, password: regIndPassword })
    if(!res.success){ alert(res.message); return }
    setTeachers([res.user]); setClasses(res.classes); setActiveClass(res.classes[0]||null); setStudents([]); setSelectedSubs([]); setCurrentUser(res.user); setPage('dashboard')
  }

  const visibleClasses = (currentUser?.role === 'OWNER' || currentUser?.role === 'HEADTEACHER')? classes : classes.filter(c=> {
    const cName = c.name.trim().toUpperCase();
    if(currentUser?.assignedClasses && currentUser.assignedClasses.length>0){
      return currentUser.assignedClasses.map(x=>x.toUpperCase()).includes(cName);
    }
    return cName === (currentUser?.assignedClass||'').trim().toUpperCase();
  })
  const isHeadteacher = currentUser?.role === 'OWNER' || currentUser?.role === 'HEADTEACHER'

  if(!currentUser){
    return (
      <div style={{minHeight:'100vh', background:'#0B1222', color:'white', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
        <div style={{background:'#151E32', border:'1px solid #23304D', borderRadius:20, padding:22, width:'100%', maxWidth:460}}>
          <div style={{textAlign:'center', marginBottom:16}}>
            <div style={{width:48, height:48, background:'white', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', fontWeight:'900', color:'black', fontSize:22}}>🎓</div>
            <h1 style={{margin:'12px 0 0', fontSize:20, fontWeight:'900'}}>Martyrs SchoolTrack</h1>
            <p style={{color:'#94A3B8', fontSize:11, marginTop:4}}>No Staff ID needed • Phone + School Code</p>
          </div>
          <div style={{display:'flex', background:'#0F172A', borderRadius:100, padding:4, gap:4, marginBottom:18}}>
            <button onClick={()=>setAuthMode('login')} style={{flex:1, padding:'10px', borderRadius:100, border:'none', fontWeight:'800', fontSize:12, cursor:'pointer', background: authMode==='login'?'white':'transparent', color: authMode==='login'?'black':'#94A3B8'}}>Sign In</button>
            <button onClick={()=>setAuthMode('registerSchool')} style={{flex:1, padding:'10px', borderRadius:100, border:'none', fontWeight:'800', fontSize:12, cursor:'pointer', background: authMode==='registerSchool'?'white':'transparent', color: authMode==='registerSchool'?'black':'#94A3B8'}}>Create Account</button>
          </div>
          {authMode==='login' && (
            <div>
              <div style={{fontSize:12, fontWeight:'600', marginBottom:6}}>School Code *</div>
              <div style={{position:'relative'}}><span style={{position:'absolute', left:12, top:12, fontSize:14}}>🏫</span><input value={loginSchoolCode} onChange={e=>setLoginSchoolCode(e.target.value.toUpperCase())} placeholder="MARTYRS2026" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:'12px 12px 12px 36px', color:'white'}}/></div>
              <div style={{fontSize:12, fontWeight:'600', marginBottom:6, marginTop:12}}>Phone Number *</div>
              <div style={{position:'relative'}}><span style={{position:'absolute', left:12, top:12, fontSize:14}}>📱</span><input value={loginPhone} onChange={e=>setLoginPhone(e.target.value)} placeholder="0244xxxxxx" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:'12px 12px 12px 36px', color:'white'}}/></div>
              <div style={{fontSize:12, fontWeight:'600', marginBottom:6, marginTop:12}}>Password *</div>
              <div style={{display:'flex', gap:8}}><div style={{position:'relative', flex:1}}><span style={{position:'absolute', left:12, top:12, fontSize:14}}>🔒</span><input type={showPass?'text':'password'} value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Enter password" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:'12px 36px 12px 36px', color:'white'}}/><span onClick={()=>setShowPass(!showPass)} style={{position:'absolute', right:12, top:12, cursor:'pointer', fontSize:14}}>{showPass?'🙈':'👁️'}</span></div></div>
              <button onClick={handleLogin_NEW} style={{width:'100%', marginTop:16, background:'white', color:'black', padding:13, borderRadius:100, border:'none', fontWeight:'800', cursor:'pointer'}}>Sign In →</button>
              <p style={{fontSize:11, color:'#64748B', textAlign:'center', marginTop:14}}>Don't have account? <span onClick={()=>setAuthMode('registerSchool')} style={{color:'white', fontWeight:'700', cursor:'pointer'}}>Create Account</span></p>
            </div>
          )}
          {authMode==='registerSchool' && (
            <div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}><div><div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>First Name *</div><input value={regFirstName} onChange={e=>{setRegFirstName(e.target.value); setRegHeadName(e.target.value+' '+regLastName)}} placeholder="Augustine" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/></div><div><div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>Last Name *</div><input value={regLastName} onChange={e=>{setRegLastName(e.target.value); setRegHeadName(regFirstName+' '+e.target.value)}} placeholder="Ansu" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/></div></div>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6, marginTop:10}}>Email *</div><input value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="head@school.com" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6, marginTop:10}}>Phone *</div><input value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="0244xxxxxx" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6, marginTop:10}}>School Name *</div><input value={regSchoolName} onChange={e=>setRegSchoolName(e.target.value)} placeholder="Martyrs Of Uganda" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6, marginTop:10}}>School Code * Unique</div><input value={regSchoolCode} onChange={e=>{setRegSchoolCode(e.target.value.toUpperCase()); setSchoolCodeError('')}} placeholder="MARTYRS2026" style={{width:'100%', background:'#0F172A', border: schoolCodeError? '1px solid #EF4444':'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
              {schoolCodeError && <div style={{color:'#EF4444', fontSize:10, marginTop:4}}>{schoolCodeError}</div>}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}><div><div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>Password *</div><input type={showPass?'text':'password'} value={regPassword} onChange={e=>setRegPassword(e.target.value)} placeholder="Min 6" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/></div><div><div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>Confirm *</div><input type={showPass?'text':'password'} value={regConfirm} onChange={e=>setRegConfirm(e.target.value)} placeholder="Confirm" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/></div></div>
              <button onClick={handleRegisterSchool_NEW} style={{width:'100%', marginTop:16, background:'#F59E0B', color:'black', padding:13, borderRadius:100, border:'none', fontWeight:'800', cursor:'pointer'}}>🏫 Create School Account</button>
              <p style={{fontSize:11, color:'#64748B', textAlign:'center', marginTop:12}}>Already have account? <span onClick={()=>setAuthMode('login')} style={{color:'white', fontWeight:'700', cursor:'pointer'}}>Sign In</span></p>
            </div>
          )}
          {authMode==='registerIndividual' && (
            <div>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>Full Name *</div><input value={regIndName} onChange={e=>setRegIndName(e.target.value)} placeholder="Your name" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white'}}/>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6, marginTop:10}}>Email *</div><input value={regIndEmail} onChange={e=>setRegIndEmail(e.target.value)} placeholder="you@gmail.com" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white'}}/>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6, marginTop:10}}>Phone *</div><input value={regIndPhone} onChange={e=>setRegIndPhone(e.target.value)} placeholder="0244xxxxxx" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white'}}/>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6, marginTop:10}}>Password *</div><input type="password" value={regIndPassword} onChange={e=>setRegIndPassword(e.target.value)} placeholder="Min 6 chars" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white'}}/>
              <button onClick={handleRegisterIndividual} style={{width:'100%', marginTop:16, background:'white', color:'black', padding:13, borderRadius:100, border:'none', fontWeight:'800', cursor:'pointer'}}>Create Individual Account</button>
            </div>
          )}
        </div>
      </div>
    )
  }
  if(page==='dashboard'){
    const greet = ()=>{ const h=new Date().getHours(); if(h<12) return 'Good Morning'; if(h<17) return 'Good Afternoon'; return 'Good Evening' }
    return (
      <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:20}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0 20px'}}><div><h1 style={{margin:0, fontSize:20}}>{greet()} {currentUser.name} 👋</h1><p style={{color:'#94A3B8', fontSize:11, marginTop:4}}>{currentUser.role} • {currentUser.school}</p></div><button onClick={handleLogout} style={{background:'#1E293B', color:'white', border:'1px solid #2A3552', padding:'8px 14px', borderRadius:100, fontSize:11, cursor:'pointer'}}>Logout</button></div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            <div style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)', borderRadius:24, padding:22, height:110}}><div style={{fontSize:11}}>MY SCHOOL</div><div style={{fontSize:18, fontWeight:'800', marginTop:6}}>{currentUser.school}</div></div>
            <div onClick={()=>setPage('myclassroom')} style={{background:'linear-gradient(135deg,#7C3AED,#4F46E5)', borderRadius:24, padding:22, height:110, cursor:'pointer'}}><div style={{fontSize:11}}>MY CLASSROOM</div><div style={{fontSize:24, fontWeight:'800'}}>{classes.length} Classes</div></div>
          </div>
          {isHeadteacher && currentUser.school!== 'Individual Teacher' && (
            <div style={{marginTop:16}}><div onClick={()=>setPage('headteacher')} style={{background:'linear-gradient(135deg,#1F2937,#422006)', border:'2px solid #F59E0B', borderRadius:20, padding:20, cursor:'pointer', display:'flex', justifyContent:'space-between'}}><div><div style={{fontSize:18, fontWeight:'900'}}>🏫 {currentUser.school} — Tap to Manage</div></div><div style={{width:40, height:40, background:'#F59E0B', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'black', fontWeight:'900'}}>→</div></div></div>
          )}
        </div>
      </div>
    )
  }
  if(page==='myclassroom'){
    return (
      <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:20}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <button onClick={()=>setPage('dashboard')} style={{background:'white', color:'black', padding:'8px 18px', borderRadius:100, border:'none', fontWeight:'700', cursor:'pointer'}}>‹ Dashboard</button>
          <h1 style={{marginTop:20}}>My Classroom — {visibleClasses.length} classes</h1>
          <div style={{marginTop:18, display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))'}}>
            {visibleClasses.map(c=> <div key={c.id} onClick={()=>{setActiveClass(c); setPage('classdetail')}} style={{background:'#1E293B', padding:22, borderRadius:20, cursor:'pointer', border:'1px solid #2A3552'}}><div style={{fontWeight:'800', fontSize:18}}>{c.name}</div><div style={{fontSize:11, color:'#94A3B8'}}>{c.school}</div></div>)}
          </div>
        </div>
      </div>
    )
  }
  if(page==='classdetail' && activeClass){
    return (
      <div style={{minHeight:'100vh', background:'#0B1222', padding:20}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <button onClick={()=>setPage('myclassroom')} style={{background:'white', border:'none', padding:'8px 16px', borderRadius:100, cursor:'pointer', fontWeight:'700'}}>‹ My Classroom</button>
          <h2 style={{fontWeight:'900', marginTop:16, color:'white'}}>{activeClass.name}</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:14, marginTop:20}}>
            <div onClick={()=>setPage('students')} style={{background:'#1E293B', border:'1px solid #2A3552', padding:22, borderRadius:16, cursor:'pointer'}}><div style={{fontSize:28}}>👨‍🎓</div><div style={{marginTop:8, fontWeight:'800', color:'white'}}>Students</div></div>
            <div onClick={()=>setPage('subjects')} style={{background:'#1E293B', border:'1px solid #3B82F6', padding:22, borderRadius:16, cursor:'pointer'}}><div style={{fontSize:28}}>📚</div><div style={{marginTop:8, fontWeight:'800', color:'white'}}>My Subjects</div></div>
            <div onClick={()=>setPage('assessments')} style={{background:'#1E293B', border:'1px solid #2A3552', padding:22, borderRadius:16, cursor:'pointer'}}><div style={{fontSize:28}}>📝</div><div style={{marginTop:8, fontWeight:'800', color:'white'}}>Assessments</div></div>
            <div onClick={()=>setPage('broadsheet')} style={{background:'#1E293B', padding:22, borderRadius:16, cursor:'pointer', border:'1px solid #F59E0B'}}><div style={{fontSize:28}}>📋</div><div style={{marginTop:8, fontWeight:'800', color:'white'}}>Broad Sheet</div></div>
            <div onClick={()=>setPage('terminal')} style={{background:'#1E293B', border:'2px solid #60A5FA', padding:22, borderRadius:16, cursor:'pointer'}}><div style={{fontSize:28}}>🖨️</div><div style={{marginTop:8, fontWeight:'800', color:'white'}}>Terminal Report</div></div>
            <div onClick={()=>setPage('levy-collector')} style={{background:'#052E16', border:'2px solid #10B981', padding:22, borderRadius:16, cursor:'pointer'}}><div style={{fontSize:28}}>💰</div><div style={{marginTop:8, fontWeight:'800', color:'white'}}>Levy Collector</div></div>
            <div onClick={()=>setPage('attendance')} style={{background:'#1E293B', border:'1px solid #2A3552', padding:22, borderRadius:16, cursor:'pointer'}}><div style={{fontSize:28}}>📅</div><div style={{marginTop:8, fontWeight:'800', color:'white'}}>Attendance</div></div>
            <div onClick={()=>setPage('teacher-info')} style={{background:'#1E293B', border:'2px solid #A78BFA', padding:22, borderRadius:16, cursor:'pointer'}}><div style={{fontSize:28}}>👨‍🏫</div><div style={{marginTop:8, fontWeight:'800', color:'white'}}>Class Teacher Info</div></div>
          </div>
        </div>
      </div>
    )
  }
  if(page==='subjects'){
    const handleSave = ()=>{ setSelectedSubs(tempSubs); setPage('classdetail') }
    return (<div style={{minHeight:'100vh', background:'#070E22', color:'white'}}><div style={{display:'flex', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid #1E293B'}}><div style={{display:'flex', gap:12, alignItems:'center'}}><button onClick={()=>setPage('classdetail')} style={{width:40, height:40, borderRadius:12, background:'#1A2236', border:'1px solid #2A3552', color:'white', cursor:'pointer'}}>‹</button><div><div style={{fontWeight:'800'}}>Subjects ({tempSubs.length})</div></div></div><button onClick={handleSave} style={{background:'white', color:'black', padding:'10px 20px', borderRadius:100, border:'none', fontWeight:'800', cursor:'pointer'}}>Save {tempSubs.length}</button></div><div style={{padding:20, maxWidth:1100, margin:'0 auto'}}><div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:12}}>{allSubjectsList.map(sub=>{ const checked = tempSubs.includes(sub); return (<div key={sub} onClick={()=> setTempSubs(checked? tempSubs.filter(x=>x!==sub) : [...tempSubs, sub])} style={{background: checked? '#1E3A8A':'#111E3B', border: checked? '2px solid #60A5FA':'1px solid #1E3A8A', padding:'18px 14px', borderRadius:12, cursor:'pointer', display:'flex', gap:10, alignItems:'center'}}><div style={{width:20, height:20, borderRadius:4, background: checked?'white':'transparent', border: checked?'none':'1.5px solid #3B82F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:'900'}}>{checked?'✓':''}</div><span style={{fontSize:11, fontWeight:'700'}}>{sub}</span></div>)})}</div></div></div>)
  }
  if(page==='teachers'){ return <TeacherManagement teachers={teachers} setTeachers={setTeachers} classes={classes} setClasses={setClasses} onBack={()=>setPage('classdetail')} /> }
  if(page==='assessments'){ return <ClassAssessments activeClass={activeClass} onBack={()=>setPage('classdetail')} /> }
  if(page==='attendance'){ return <AttendanceRegister activeClass={activeClass} students={students} onBack={()=>setPage('classdetail')} /> }
  if(page==='broadsheet'){ return <MasterSheet activeClass={activeClass} onBack={()=>setPage('classdetail')} /> }
  if(page==='headteacher'){ return <HeadteacherDashboard classes={classes} setClasses={setClasses} teachers={teachers} setTeachers={setTeachers} onBack={()=>setPage('dashboard')} setPage={setPage} /> }
  if(page==='schoolsettings'){ return <SchoolSettings onBack={()=>setPage('dashboard')} /> }
  if(page==='terminal'){ return <TerminalReport activeClass={activeClass} onBack={()=>setPage('classdetail')} /> }
  if(page==='levy-master'){ return <LevyMaster onBack={()=>setPage('headteacher')} /> }
  if(page==='lesson-notes'){ return <LessonNoteSubmission onBack={()=>setPage('headteacher')} /> }
  if(page==='work-output'){ return <WorkOutputChart onBack={()=>setPage('headteacher')} /> }
  if(page==='levy-collector'){ return <LevyCollector activeClass={activeClass} onBack={()=>setPage('classdetail')} /> }
  if(page==='teacher-info'){ return <TeacherInfo activeClass={activeClass} onBack={()=>setPage('classdetail')} /> }
  return <div style={{color:'white', padding:20, background:'#0B1222', minHeight:'100vh'}}>Loading {page}...</div>
}