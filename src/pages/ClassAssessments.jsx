import { useState, useEffect, useMemo } from 'react'
import { getActiveSchoolId, getClassKeyVersioned } from '../utils/storage.js'

export default function ClassAssessments({ activeClass, onBack }){
  const className = activeClass?.name || 'Class 1'
  const sid = getActiveSchoolId()
  const storageKey = `${sid}_assessments_${className}`
  const marksKey = `${sid}_marks_${className}`
  const subsKey = getClassKeyVersioned(className, 'selectedSubs', 'v1')
  const studentsKey = getClassKeyVersioned(className, 'students', 'v2')

  const [assessments, setAssessments] = useState(()=>{ try{ return JSON.parse(localStorage.getItem(storageKey)||'[]') }catch{return []} })
  const [selectedAss, setSelectedAss] = useState(()=>{ try{ return JSON.parse(localStorage.getItem(`${sid}_activeAssessment_${className}`)||'null') }catch{return null} })
  const [showAdd, setShowAdd] = useState(false)
  const [term, setTerm] = useState('Term 1')
  const [academicYear, setAcademicYear] = useState('2025/2026')
  const [nextTermDate, setNextTermDate] = useState('2026-09-03')
  const [grading, setGrading] = useState('Competency — Advance, Proficient, Approaching')
  const [assessmentType, setAssessmentType] = useState('End of Term')
  const [classScore, setClassScore] = useState(50)
  const [subjectTab, setSubjectTab] = useState('')
  const [isEditing, setIsEditing] = useState(true) // default editing ON so you can type immediately

  const students = useMemo(()=>{
    try{ const s=localStorage.getItem(studentsKey); const p=s?JSON.parse(s):[]; return p.map(x=>({id:x.id, name:`${x.firstName||''} ${x.otherNames||''}`.trim()})).filter(x=>x.name) }catch{return []}
  }, [studentsKey])

  // ONLY FROM MY SUBJECTS - NO FALLBACK TO 16
  const subjects = useMemo(()=>{
    try{ const v=localStorage.getItem(subsKey); if(v){ const sel=JSON.parse(v); if(sel&&sel.length>0) return sel } }catch{}
    return []
  }, [subsKey])

  useEffect(()=>{ if(subjects.length>0 &&!subjectTab) setSubjectTab(subjects[0]) }, [subjects])

  const [allMarks, setAllMarks] = useState(()=>{ try{return JSON.parse(localStorage.getItem(marksKey)||'{}')}catch{return {}} })
  useEffect(()=>localStorage.setItem(marksKey, JSON.stringify(allMarks)), [allMarks, marksKey])
  useEffect(()=>localStorage.setItem(storageKey, JSON.stringify(assessments)), [assessments, storageKey])
  useEffect(()=>{ if(selectedAss) localStorage.setItem(`${sid}_activeAssessment_${className}`, JSON.stringify(selectedAss)) }, [selectedAss])

  const createAssessment = ()=>{
    if(subjects.length===0){ alert('Go to My Subjects and select subjects first!'); return }
    const cs=Number(classScore); if(cs>50){alert('Max 50%'); setClassScore(50); return}
    const newAss={id:Date.now(), term, academicYear, nextTermDate, gradingSystem:grading, assessmentType, classScore:cs, examScore:100-cs, className}
    setAssessments([newAss,...assessments]); setShowAdd(false); setSelectedAss(newAss); setSubjectTab(subjects[0]); setIsEditing(true)
  }
  const deleteAssessment = (id,e)=>{ if(e) e.stopPropagation(); if(!confirm('Delete?')) return; setAssessments(assessments.filter(a=>a.id!==id)); const c={...allMarks}; delete c[id]; setAllMarks(c); if(selectedAss?.id===id) setSelectedAss(null) }
  const getMark = (assId, name, sub)=> allMarks[assId]?.[name]?.[sub] || {cs:'', ex:''}
  const setMark = (assId, name, sub, field, value)=>{
    const max = field==='cs'? selectedAss.classScore : 100
    const v = value===''? '' : Math.min(max, Math.max(0, Number(value)||0))
    setAllMarks(prev=>{ const copy=JSON.parse(JSON.stringify(prev)); if(!copy[assId]) copy[assId]={}; if(!copy[assId][name]) copy[assId][name]={}; if(!copy[assId][name][sub]) copy[assId][name][sub]={cs:'',ex:''}; copy[assId][name][sub][field]=v; return copy })
  }

  const tableData = useMemo(()=>{
    if(!selectedAss || subjects.length===0) return []
    const rows = students.map((s, idx)=>{
      const arr = subjects.map(sub=>{ const m=getMark(selectedAss.id, s.name, sub); const cs=Number(m.cs)||0, ex=Number(m.ex)||0; const cex=ex*(selectedAss.examScore/100); return {sub, cs, ex, cex, tot:cs+cex} })
      return {name:s.name, id:s.id, originalIndex:idx, subjects:arr, overall:arr.reduce((a,b)=>a+b.tot,0)}
    })
    const si = subjects.indexOf(subjectTab)
    const sortedSub = [...rows].sort((a,b)=> (b.subjects[si]?.tot||0)-(a.subjects[si]?.tot||0))
    const sortedOverall = [...rows].sort((a,b)=> b.overall-a.overall)
    return rows.map(r=>({...r, subPos: sortedSub.findIndex(x=>x.name===r.name)+1, overPos: sortedOverall.findIndex(x=>x.name===r.name)+1})).sort((a,b)=>a.originalIndex-b.originalIndex)
  }, [allMarks, selectedAss, subjectTab, subjects, students])

  if(showAdd){
    return (<div style={{minHeight:'100vh', background:'#0A0F1E', display:'flex', justifyContent:'center'}}><div style={{background:'#0F172A', width:'100%', maxWidth:500, minHeight:'100vh'}}>
      <div style={{display:'flex', justifyContent:'space-between', padding:'18px 20px'}}><div><div style={{fontWeight:800, color:'white'}}>New Assessment</div><div style={{fontSize:11, color:'#94A3B8'}}>{className} — {subjects.length} subjects from My Subjects</div></div><button onClick={()=>setShowAdd(false)} style={{background:'transparent', border:'none', color:'white', fontSize:22}}>×</button></div>
      <div style={{padding:18, display:'grid', gap:16}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>{['Term 1','Term 2','Term 3'].map(t=><button key={t} onClick={()=>setTerm(t)} style={{padding:12, borderRadius:12, border:'none', background:term===t?'white':'#1E293B', color:term===t?'black':'white', fontWeight:800}}>{t}</button>)}</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}><input value={academicYear} onChange={e=>setAcademicYear(e.target.value)} style={{background:'#1E293B', border:'1px solid #334155', borderRadius:12, padding:12, color:'white'}}/><input type="date" value={nextTermDate} onChange={e=>setNextTermDate(e.target.value)} style={{background:'#1E293B', border:'1px solid #334155', borderRadius:12, padding:12, color:'white'}}/></div>
        {subjects.length===0 && <div style={{background:'#7F1D1D', padding:10, borderRadius:10, fontSize:11, color:'#FECACA'}}>No subjects — Go to My Subjects first</div>}
        <button onClick={createAssessment} style={{width:'100%', background:'white', color:'black', padding:14, borderRadius:100, border:'none', fontWeight:800}}>Create with {subjects.length} subjects</button>
      </div></div></div>)
  }

  if(selectedAss){
    return (
      <div style={{minHeight:'100vh', background:'#0A0F1E', color:'white'}}>
        <div style={{display:'flex', gap:10, padding:'12px 16px', alignItems:'center'}}>
          <button onClick={()=>setSelectedAss(null)} style={{width:32, height:32, borderRadius:8, background:'#151C2F', border:'1px solid #1E293B', color:'white'}}>‹</button>
          <div style={{fontWeight:800, fontSize:13}}>{className} • {subjects.length} subjects (from My Subjects)</div>
          <button onClick={()=>setIsEditing(!isEditing)} style={{marginLeft:'auto', background:isEditing?'white':'#151C2F', color:isEditing?'black':'white', border:'1px solid #2A3552', padding:'6px 12px', borderRadius:8, fontSize:11, fontWeight:'800'}}>{isEditing?'Editing ON':'Edit'}</button>
          <button onClick={()=>{ localStorage.setItem(`${sid}_activeAssessment_${className}`, JSON.stringify(selectedAss)); alert('Saved as ACTIVE for Broadsheet & Report')}} style={{background:'#E2E8F0', color:'black', padding:'6px 12px', borderRadius:8, fontSize:11, fontWeight:'800', border:'none'}}>💾 Finish</button>
        </div>

        <div style={{margin:'0 12px', background:'#11192E', border:'1px solid #1E293B', borderRadius:12, padding:8, display:'flex', gap:6, overflowX:'auto'}}>
          {subjects.map(sub=> <button key={sub} onClick={()=>setSubjectTab(sub)} style={{background:subjectTab===sub?'white':'#151C2F', color:subjectTab===sub?'black':'#64748B', border:'1px solid #1E293B', padding:'8px 14px', borderRadius:10, fontSize:11, fontWeight:'800', flexShrink:0}}>{sub}</button>)}
        </div>

        {students.length===0? <div style={{padding:40, textAlign:'center', color:'#64748B'}}>No students — add in Students page</div> :
        <div style={{marginTop:12, overflowX:'auto', borderTop:'1px solid #1E293B'}}>
          <div style={{minWidth:760}}>
            <div style={{display:'grid', gridTemplateColumns:'160px 1fr 120px', background:'#1E293B', padding:'10px 0'}}>
              <div style={{padding:'0 12px', fontSize:11, color:'#94A3B8', fontWeight:'700'}}>Student</div>
              <div style={{display:'grid', gridTemplateColumns:'70px 70px 70px 70px 60px', textAlign:'center', fontSize:10, color:'#64748B', fontWeight:'800'}}><span>CS({selectedAss.classScore})</span><span>EX</span><span>CEX</span><span>TOT</span><span>POS</span></div>
              <div style={{display:'grid', gridTemplateColumns:'60px 60px', textAlign:'center', fontSize:10, color:'#64748B', fontWeight:'800'}}><span>TOTAL</span><span>POS</span></div>
            </div>
            {tableData.map(row=>{
              const d=row.subjects[subjects.indexOf(subjectTab)]||{cs:0,ex:0,cex:0,tot:0}
              return (
                <div key={row.name} style={{display:'grid', gridTemplateColumns:'160px 1fr 120px', borderTop:'1px solid #1E293B', background:'#0F172A', padding:'8px 0', alignItems:'center'}}>
                  <div style={{padding:'0 12px', fontSize:12, fontWeight:'700'}}>{row.name}</div>
                  <div style={{display:'grid', gridTemplateColumns:'70px 70px 70px 70px 60px', gap:4}}>
                    <input type="number" value={getMark(selectedAss.id, row.name, subjectTab).cs} onChange={e=>setMark(selectedAss.id, row.name, subjectTab, 'cs', e.target.value)} placeholder="CS" style={{background:'#1E293B', border:'1px solid #60A5FA', borderRadius:8, padding:8, color:'white', textAlign:'center'}}/>
                    <input type="number" value={getMark(selectedAss.id, row.name, subjectTab).ex} onChange={e=>setMark(selectedAss.id, row.name, subjectTab, 'ex', e.target.value)} placeholder="EX" style={{background:'#1E293B', border:'1px solid #60A5FA', borderRadius:8, padding:8, color:'white', textAlign:'center'}}/>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#64748B'}}>{d.cex.toFixed(1)}</div>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', background:'#1E293B', borderRadius:8, fontSize:11, fontWeight:'800'}}>{d.tot.toFixed(1)}</div>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}><span style={{border:'1px solid #FBBF24', color:'#FBBF24', borderRadius:8, padding:'4px 8px', fontSize:10, fontWeight:'700'}}>{row.subPos}th</span></div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'60px 60px'}}><div style={{textAlign:'center', fontSize:12, fontWeight:'800'}}>{row.overall.toFixed(1)}</div><div style={{textAlign:'center'}}><span style={{border:'1px solid #FBBF24', color:'#FBBF24', borderRadius:8, padding:'4px 8px', fontSize:10}}>{row.overPos}th</span></div></div>
                </div>
              )
            })}
          </div>
        </div>
        }
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', background:'#0A0F1E', color:'white'}}>
      <div style={{display:'flex', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid #1E293B'}}>
        <div style={{display:'flex', gap:12, alignItems:'center'}}><button onClick={onBack} style={{width:40, height:40, borderRadius:12, background:'#151C2F', border:'1px solid #1E293B', color:'white'}}>‹</button><div><div style={{fontWeight:800}}>{className} Assessments</div><div style={{fontSize:11, color:'#F59E0B'}}>{subjects.length} subjects from My Subjects • {assessments.length} assessments • {students.length} students</div></div></div>
        <button onClick={()=>setShowAdd(true)} style={{background:'white', color:'black', padding:'10px 18px', borderRadius:100, border:'none', fontWeight:'800', fontSize:13}}>Create Assessment</button>
      </div>
      <div style={{padding:16, maxWidth:900, margin:'0 auto'}}>
        {subjects.length===0 && <div style={{background:'#422006', border:'1px solid #F59E0B', borderRadius:12, padding:16, textAlign:'center'}}><div style={{fontWeight:800, color:'#FDE68A'}}>No Subjects Selected</div><div style={{fontSize:11, color:'#FCD34D', marginTop:6}}>Go to My Subjects and select e.g. 4 subjects. Then assessment will show only 4, not 16.</div><button onClick={onBack} style={{marginTop:10, background:'#F59E0B', color:'black', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:'800', fontSize:11}}>Go to My Subjects</button></div>}
        {subjects.length>0 && assessments.length===0 && <div style={{background:'#111E3B', border:'1px dashed #2A4AB7', borderRadius:16, padding:40, textAlign:'center', marginTop:20}}><div style={{fontSize:36}}>📝</div><div style={{fontWeight:800, marginTop:10}}>No Assessments Yet</div><div style={{fontSize:11, color:'#94A3B8'}}>Will use {subjects.length} subjects: {subjects.join(', ')}</div></div>}
        {assessments.map(a=>{
          const isActive = (()=>{try{return JSON.parse(localStorage.getItem(`${sid}_activeAssessment_${className}`)||'{}').id===a.id}catch{return false}})()
          return (<div key={a.id} style={{background:'#151E32', border:'1px solid #1E293B', borderRadius:14, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}><div onClick={()=>{ setSelectedAss(a); setSubjectTab(subjects[0]); }} style={{flex:1, cursor:'pointer'}}><div style={{fontWeight:800}}>{a.term} • {a.assessmentType} {isActive&&<span style={{background:'#10B981', padding:'2px 8px', borderRadius:100, fontSize:9, marginLeft:8}}>ACTIVE</span>}</div><div style={{fontSize:11, color:'#94A3B8', marginTop:4}}>{a.academicYear} • {subjects.length} subjects</div></div><div style={{display:'flex', gap:8}}><button onClick={()=>{ setSelectedAss(a); setSubjectTab(subjects[0]); }} style={{background:'#1E293B', border:'1px solid #334155', color:'white', padding:'8px 14px', borderRadius:8, fontSize:11, fontWeight:'700'}}>Open →</button><button onClick={(e)=>deleteAssessment(a.id,e)} style={{background:'#7F1D1D', border:'1px solid #DC2626', color:'white', padding:'8px 12px', borderRadius:8, fontSize:11}}>🗑</button></div></div>)
        })}
      </div>
    </div>
  )
}