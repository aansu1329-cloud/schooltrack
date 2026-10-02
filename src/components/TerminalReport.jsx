import { useState, useEffect, useMemo } from 'react'
import { getActiveSchoolId, getClassKeyVersioned } from '../utils/storage.js'

export default function TerminalReport({ activeClass, onBack }){
  const className = activeClass?.name || activeClass?.className || 'Class 1'
  const sid = getActiveSchoolId()

  // SCHOOL ISOLATED KEYS
  const studentsKey = getClassKeyVersioned(className, 'students', 'v2')
  const subsKey = getClassKeyVersioned(className, 'selectedSubs', 'v1')
  const marksKey = `${sid}_marks_${className}`
  const assessKey = `${sid}_assessments_${className}`
  const activeKey = `${sid}_activeAssessment_${className}`
  const schoolInfoKey = `${sid}_schoolInfo_v1`

  const schoolInfo = useMemo(()=>{ try{return JSON.parse(localStorage.getItem(schoolInfoKey) || '{}')}catch{return {}} }, [schoolInfoKey])

  const assessments = useMemo(()=>{ try{return JSON.parse(localStorage.getItem(assessKey) || '[]')}catch{return []}}, [assessKey])
  const allMarks = useMemo(()=>{ try{return JSON.parse(localStorage.getItem(marksKey) || '{}')}catch{return {}}}, [marksKey])
  const activeAssStored = useMemo(()=>{ try{return JSON.parse(localStorage.getItem(activeKey) || 'null')}catch{return null}}, [activeKey])

  const [selectedAssId, setSelectedAssId] = useState(activeAssStored?.id || assessments[0]?.id || null)
  useEffect(()=>{ if(!selectedAssId && assessments[0]) setSelectedAssId(assessments[0].id) }, [assessments, selectedAssId])

  const selectedAss = assessments.find(a=>a.id===selectedAssId) || activeAssStored || assessments[0] || null

  // EMPTY UNTIL ASSESSMENT EXISTS - AS YOU WANTED
  if(!selectedAss){
    return (
      <div style={{minHeight:'100vh', background:'#E5E7EB', padding:20}}>
        <div style={{maxWidth:900, margin:'0 auto'}}>
          <button onClick={onBack} style={{background:'black', color:'white', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:'700'}}>‹ Back to {className}</button>
          <div style={{marginTop:40, background:'white', borderRadius:16, padding:30, textAlign:'center'}}>
            <div style={{fontSize:40}}>📊</div>
            <div style={{fontWeight:'900', marginTop:10}}>No Assessment Yet for {className}</div>
            <div style={{fontSize:12, color:'#64748B', marginTop:6}}>Terminal Report is empty until teacher creates assessment and clicks 💾 Finish. This is as you requested — no fake data.</div>
          </div>
        </div>
      </div>
    )
  }

  const studentsRaw = useMemo(()=>{
    try{ return JSON.parse(localStorage.getItem(studentsKey)||'[]') }catch{ return [] }
  }, [studentsKey])

  const teachers = useMemo(()=>{
    try{ return JSON.parse(localStorage.getItem(`${sid}_teachers`)||'[]') }catch{ return [] }
  }, [sid])

  const students = studentsRaw.map(s=>({...s, fullName: `${s.firstName||''} ${s.otherNames||''}`.trim()||s.name, photo: s.photo}))
  const [selectedId, setSelectedId] = useState(students[0]?.id || 0)
  const [extra, setExtra] = useState(()=>{ try{return JSON.parse(localStorage.getItem(`${sid}_report_extra_${className}`)||'{}')}catch{return{}} })
  const [theme, setTheme] = useState(()=> localStorage.getItem(`${sid}_reportTheme_${className}`) || 'classic')
  const [isBook, setIsBook] = useState(false)
  useEffect(()=> localStorage.setItem(`${sid}_report_extra_${className}`, JSON.stringify(extra)), [extra, className, sid])
  useEffect(()=> localStorage.setItem(`${sid}_reportTheme_${className}`, theme), [theme, className, sid])

  // ONLY SELECTED 4 SUBJECTS - DEDUPED, NO FALLBACK TO 16
  const subjectsList = useMemo(()=>{
    try{
      const sel = JSON.parse(localStorage.getItem(subsKey)||'null')
      if(sel?.length){
        const seen=new Set(); const out=[];
        for(let raw of sel){
          let name = typeof raw==='string'? raw : (raw.name||raw.subject||'')
          name=name.trim(); if(!name) continue
          const key=name.toLowerCase().replace(/\s+/g,' ').trim()
          if(!seen.has(key)){ seen.add(key); out.push(name) }
        }
        return out
      }
    }catch{}
    return []
  }, [subsKey])

  const getMark = (fullName, subject)=>{
    const m = allMarks[selectedAssId]?.[fullName]?.[subject]
    if(!m) return {cs:'', ex:'', cex:0, tot:0}
    const cs=Number(m.cs)||0, ex=Number(m.ex)||0, cex=ex*(selectedAss.examScore/100)
    return {cs, ex, cex, tot: cs+cex}
  }
  const getRemark = (tot)=>{
    const g=(selectedAss.gradingSystem||'').toLowerCase()
    if(g.includes('bece')){ if(tot>=90)return'Grade 1'; if(tot>=80)return'Grade 2'; if(tot>=70)return'Grade 3'; if(tot>=55)return'Grade 5'; if(tot>=40)return'Grade 6'; if(tot>0)return'Grade 9'; return''}
    if(tot>=80)return'Advanced'; if(tot>=60)return'Proficient'; if(tot>=40)return'Approaching'; if(tot>0)return'Developing'; return''
  }
  const totals = useMemo(()=> students.map(s=>{ let t=0; subjectsList.forEach(sub=> t+=getMark(s.fullName,sub).tot); return {id:s.id, name:s.fullName, total:t}}).sort((a,b)=>b.total-a.total), [students, subjectsList, allMarks, selectedAssId])
  const posMap={}; totals.forEach((t,i)=>{ const f=totals.findIndex(x=>x.total===t.total); posMap[t.id]=f+1 })
  const ord=(n)=>{ const s=["th","st","nd","rd"]; const v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]) }
  const getSubPos=(sid,sub)=>{ const list=students.map(s=>({id:s.id, tot:getMark(s.fullName,sub).tot})).sort((a,b)=>b.tot-a.tot); const idx=list.findIndex(x=>x.id===sid); return idx>=0? ord(idx+1):'-' }
  const defaultCur={attendance:'54', outOf:'57', promoted:'Yes', conduct:'Exceptionally Well-Behaved, Highly Disciplined and Very Respectful', attitude:'Highly Diligent, Exceptionally Attentive and Takes Pride in Learning', interest:'Demonstrates Keen Interest in Creative Arts, Drawing and Innovative Practical Activities', teacherRemark:'An outstanding performance. Keep it up! You have great potential.', reopening:selectedAss.nextTermDate}
  const getCur=(sid)=> extra[sid] || defaultCur
  const upd=(sid,f,v)=> setExtra({...extra, [sid]: {...getCur(sid), [f]:v}})
  const classTeacher = teachers.find(t=>t.assignedClass===className) || teachers[0]
  const headTeacherName = schoolInfo.headTeacherName || localStorage.getItem(`${sid}_headTeacherName`) || 'MR. JOHN ATTA'
  const headSig = localStorage.getItem(`${sid}_headSignature`) || schoolInfo.signature
  const themes={classic:{headerBg:'white', headerColor:'black', headerBorder:'2.5px solid black', tableHead:'#111827', tableHeadColor:'white', accent:'black', paperBorder:'2.5px solid black'}, royal:{headerBg:'#1E3A8A', headerColor:'white', headerBorder:'none', tableHead:'#1E3A8A', tableHeadColor:'white', accent:'#1E3A8A', paperBorder:'2.5px solid #1E3A8A'}, emerald:{headerBg:'#065F46', headerColor:'white', headerBorder:'none', tableHead:'#065F46', tableHeadColor:'white', accent:'#065F46', paperBorder:'2.5px solid #065F46'}}
  const th=themes[theme]

  const conductOptions=["Exceptionally Well-Behaved, Highly Disciplined and Very Respectful","Highly Respectful, Obedient, Courteous and Well-Mannered","A Model of Good Conduct, Very Polite and Disciplined","Well-Behaved, Calm and Shows Great Respect for Authority","Generally Well-Behaved but Needs Occasional Guidance"]
  const attitudeOptions=["Highly Diligent, Exceptionally Attentive and Takes Pride in Learning","Very Serious, Focused, Hardworking and Participates Actively","Remarkably Serious, Attentive in Class and Eager to Learn","Shows Great Enthusiasm, Cooperative and Attentive"]
  const interestOptions=["Demonstrates Keen Interest in Creative Arts, Drawing and Innovative Practical Activities","Shows Profound Interest in Reading, Storytelling and Language Activities","Highly Interested in Numeracy, Problem Solving and Logical Reasoning","Passionate About Science, Exploration and Discovery","Enjoys Sports, Physical Activities, Music and Dance"]
  const teacherRemarkOptions=["An outstanding performance. Keep it up! You have great potential.","Excellent performance! You are a star. Keep soaring higher.","Very good performance. With more effort, you will be among the best.","Good performance. You can do better with determination and hard work.","A fair performance. Needs to be more serious and attentive in class."]

  const ReportPage=({student})=>{
    const cur=getCur(student.id)
    const rows=subjectsList.map(sub=>({sub,...getMark(student.fullName,sub)}))
    const totalScore=totals.find(t=>t.id===student.id)?.total||0
    const editable=!isBook
    return(
      <div style={{width:'210mm', margin:'0 auto', background:'white', color:'black', padding:'6mm 8mm', fontFamily:'Times New Roman, serif', fontSize:'11px', lineHeight:1.3, display:'flex', flexDirection:'column'}} className="report-sheet">
        <div style={{border: th.paperBorder, flex:1, padding:'4mm 5mm', display:'flex', flexDirection:'column'}}>
          <div style={{display:'grid', gridTemplateColumns:'55px 1fr 55px', alignItems:'center', borderBottom:th.headerBorder, background:th.headerBg, color:th.headerColor, padding:th.headerBg==='white'? '0 0 5px 0':'6px', borderRadius:th.headerBg==='white'?0:4}}>
            <div>{schoolInfo.logo? <img src={schoolInfo.logo} style={{width:50,height:50,objectFit:'contain'}}/>:<div style={{width:50,height:50,border:'1px solid black',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'900',fontSize:7}}>LOGO</div>}</div>
            <div style={{textAlign:'center'}}><div style={{fontWeight:'900',fontSize:12,textTransform:'uppercase'}}>{schoolInfo.schoolName||'MARTYRS OF UGANDA R/C KG/PRIM. A'}</div><div style={{fontSize:7.5,fontWeight:'700'}}>{schoolInfo.district||'SEKYERE AFRAM PLAINS'} {schoolInfo.phone?`• ${schoolInfo.phone}`:''}</div><div style={{marginTop:4,border:th.headerBg==='white'?'1.5px solid black':'1.5px solid white',padding:'2px 12px',fontWeight:'900',fontSize:9,display:'inline-block'}}>TERMINAL REPORT SHEET</div></div>
            <div>{student.photo? <img src={student.photo} style={{width:50,height:60,objectFit:'cover',border:'1px solid black'}}/>:<div style={{width:50,height:60,border:'1px solid black',display:'flex',alignItems:'center',justifyContent:'center',fontSize:6}}>PHOTO</div>}</div>
          </div>
          <div style={{marginTop:6,fontWeight:'800',fontSize:11}}>NAME: <span style={{textTransform:'uppercase',fontWeight:'900',fontSize:11.5}}>{student.fullName}</span></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginTop:5,fontWeight:'700',fontSize:10}}><div>BASIC: {className}</div><div>YEAR: {selectedAss.academicYear}</div><div>TERM: {selectedAss.term}</div></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1.8fr',gap:6,marginTop:4,fontWeight:'700',fontSize:10}}><div>POS: {ord(posMap[student.id]||1)}</div><div>TOTAL: {totalScore.toFixed(1)}</div><div>ROLL: {students.length}</div><div>REOPENING: <span style={{borderBottom:'1.2px solid black',fontWeight:'900'}}>{cur.reopening}</span></div></div>
          <table style={{width:'100%',borderCollapse:'collapse',marginTop:6,border:`1.5px solid ${th.accent}`}}>
            <thead><tr style={{background:th.tableHead,color:th.tableHeadColor}}><th style={{border:`1px solid ${th.accent}`,padding:'4px 4px',textAlign:'left',width:'28%',fontWeight:'900',fontSize:10}}>SUBJECTS ({subjectsList.length} ONLY)</th><th style={{border:`1px solid ${th.accent}`,padding:'3px 2px',fontWeight:'900',fontSize:8.5}}>Class {selectedAss.classScore}%</th><th style={{border:`1px solid ${th.accent}`,padding:'3px 2px',fontWeight:'900',fontSize:8.5}}>Exam {selectedAss.examScore}%</th><th style={{border:`1px solid ${th.accent}`,padding:'3px 2px',fontWeight:'900',fontSize:8.5}}>Total</th><th style={{border:`1px solid ${th.accent}`,padding:'3px 2px',fontWeight:'900',fontSize:8.5}}>Pos</th><th style={{border:`1px solid ${th.accent}`,padding:'3px 2px',fontWeight:'900',fontSize:8.5}}>Remarks</th></tr></thead>
            <tbody>{rows.map((r,i)=><tr key={r.sub} style={{background:i%2===0?'#f9f9f9':'white'}}><td style={{border:`1px solid ${th.accent}`,padding:'3.5px 5px',fontWeight:'900',fontSize:10}}>{r.sub}</td><td style={{border:`1px solid ${th.accent}`,padding:'3px',textAlign:'center',fontWeight:'800'}}>{r.cs!==''?r.cs:''}</td><td style={{border:`1px solid ${th.accent}`,padding:'3px',textAlign:'center',fontWeight:'800'}}>{r.cex?r.cex.toFixed(1):''}</td><td style={{border:`1px solid ${th.accent}`,padding:'3px',textAlign:'center',fontWeight:'900'}}>{r.tot?r.tot.toFixed(1):''}</td><td style={{border:`1px solid ${th.accent}`,padding:'3px',textAlign:'center',fontWeight:'900',fontSize:9}}>{r.tot?getSubPos(student.id,r.sub):''}</td><td style={{border:`1px solid ${th.accent}`,padding:'3px',textAlign:'center',fontWeight:'800',fontSize:8}}>{r.tot?getRemark(r.tot):''}</td></tr>)}</tbody>
          </table>
          <div style={{marginTop:8,display:'grid',gap:6,fontSize:10,fontWeight:'700'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><div>ATTENDANCE: <span className="print-only">{cur.attendance} OUT OF {cur.outOf}</span>{editable&&<span className="no-print"><input value={cur.attendance} onChange={e=>upd(student.id,'attendance',e.target.value)} style={{width:28,border:'none',borderBottom:'1px solid black',textAlign:'center',fontWeight:'700',outline:'none'}}/> OUT OF <input value={cur.outOf} onChange={e=>upd(student.id,'outOf',e.target.value)} style={{width:28,border:'none',borderBottom:'1px solid black',textAlign:'center',fontWeight:'700',outline:'none'}}/></span>}</div><div style={{marginLeft:'auto'}}>PROMOTED: <span className="print-only" style={{fontWeight:'900'}}>{cur.promoted}</span>{editable&&<select className="no-print" value={cur.promoted} onChange={e=>upd(student.id,'promoted',e.target.value)} style={{border:'none',borderBottom:'1px solid black',fontSize:10,fontWeight:'700',outline:'none',background:'transparent'}}><option>Yes</option><option>No</option><option>On Trial</option></select>}</div></div>
            <div>CONDUCT: <span className="print-only">{cur.conduct}</span>{editable&&<select className="no-print" value={cur.conduct} onChange={e=>upd(student.id,'conduct',e.target.value)} style={{border:'none',borderBottom:'1px dotted #999',fontSize:9.5,fontWeight:'600',outline:'none',background:'transparent',width:'80%',padding:'2px 0'}}><option value="">-- Select --</option>{conductOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>}</div>
            <div>ATTITUDE: <span className="print-only">{cur.attitude}</span>{editable&&<select className="no-print" value={cur.attitude} onChange={e=>upd(student.id,'attitude',e.target.value)} style={{border:'none',borderBottom:'1px dotted #999',fontSize:9.5,fontWeight:'600',outline:'none',background:'transparent',width:'80%',padding:'2px 0'}}><option value="">-- Select --</option>{attitudeOptions.map(o=><option key={o}>{o}</option>)}</select>}</div>
            <div>INTEREST: <span className="print-only">{cur.interest}</span>{editable&&<select className="no-print" value={cur.interest} onChange={e=>upd(student.id,'interest',e.target.value)} style={{border:'none',borderBottom:'1px dotted #999',fontSize:9.5,fontWeight:'600',outline:'none',background:'transparent',width:'80%',padding:'2px 0'}}><option value="">-- Select --</option>{interestOptions.map(o=><option key={o}>{o}</option>)}</select>}</div>
            <div>REMARKS: <span className="print-only">{cur.teacherRemark}</span>{editable&&<select className="no-print" value={cur.teacherRemark} onChange={e=>upd(student.id,'teacherRemark',e.target.value)} style={{border:'none',borderBottom:'1px dotted #999',fontSize:9.5,fontWeight:'600',outline:'none',background:'transparent',width:'70%',padding:'2px 0'}}><option value="">-- Select --</option>{teacherRemarkOptions.map(o=><option key={o}>{o}</option>)}</select>}</div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:'auto',paddingTop:10}}>
            <div style={{width:'42%',textAlign:'center'}}><div style={{height:36,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>{classTeacher?.signature? <img src={classTeacher.signature} style={{maxWidth:100,maxHeight:36,objectFit:'contain'}}/>:null}</div><div style={{borderTop:`1.5px solid ${th.accent}`,paddingTop:3,fontWeight:'900',color:th.accent,fontSize:8.5}}>Class Teacher's Signature</div><div style={{fontSize:7,fontWeight:'700'}}>{classTeacher?.name||''}</div></div>
            <div style={{width:'42%',textAlign:'center'}}><div style={{height:36,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>{headSig? <img src={headSig} style={{maxWidth:60,maxHeight:45,objectFit:'contain'}}/>:null}</div><div style={{borderTop:`1.5px solid ${th.accent}`,paddingTop:3,fontWeight:'900',color:th.accent,fontSize:8.5}}>Headteacher's Signature</div><div style={{fontSize:8,fontWeight:'900',textTransform:'uppercase'}}>{headTeacherName}</div></div>
          </div>
        </div>
      </div>
    )
  }

  return(
    <div style={{minHeight:'100vh',background:'#E5E7EB',padding:6}}>
      <div className="no-print" style={{maxWidth:920,margin:'0 auto 6px',background:'white',padding:8,borderRadius:10,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:6}}>
        <div style={{display:'flex',gap:6}}><button onClick={onBack} style={{background:'black',color:'white',padding:'6px 12px',borderRadius:100,border:'none',fontWeight:'800'}}>‹ Back</button><select value={selectedId} onChange={e=>{ setSelectedId(Number(e.target.value)); setIsBook(false)}} style={{padding:6,borderRadius:6,fontWeight:'700',fontSize:11}}>{students.map(s=><option key={s.id} value={s.id}>{s.fullName}</option>)}</select><select value={selectedAssId||''} onChange={e=>setSelectedAssId(Number(e.target.value))} style={{padding:6,borderRadius:6,fontSize:10}}>{assessments.map(a=><option key={a.id} value={a.id}>{a.term} • {a.academicYear}</option>)}</select></div>
        <div style={{display:'flex',gap:5,alignItems:'center'}}><div style={{display:'flex',gap:3,background:'#F1F5F9',padding:3,borderRadius:100}}>{Object.keys(themes).map(k=><button key={k} onClick={()=>setTheme(k)} style={{padding:'5px 10px',borderRadius:100,border:'none',fontWeight:'900',fontSize:9,background:theme===k?'black':'white',color:theme===k?'white':'black'}}>{k.toUpperCase()}</button>)}</div><button onClick={()=>{ setIsBook(false); setTimeout(()=>window.print(),200)}} style={{background:'black',color:'white',padding:'6px 14px',borderRadius:100,border:'none',fontWeight:'900',fontSize:11}}>🖨️ Single</button><button onClick={()=>{ setIsBook(true); setTimeout(()=>window.print(),400)}} style={{background:'#1E3A8A',color:'white',padding:'6px 14px',borderRadius:100,border:'none',fontWeight:'900',fontSize:11}}>📚 Book ({students.length})</button></div>
      </div>
      {subjectsList.length===0 && <div style={{maxWidth:920, margin:'10px auto', background:'#422006', border:'1px solid #F59E0B', borderRadius:10, padding:12, textAlign:'center', color:'#FDE68A', fontSize:11}}>No subjects selected for {className} — Go to My Subjects and select 4. Report will show ONLY those 4.</div>}
      {!isBook && students.length>0 && <ReportPage student={students.find(s=>s.id===selectedId)||students[0]}/>}
      {isBook && <div>{students.map(s=> <div key={s.id} className="book-page"><ReportPage student={s}/></div>)}</div>}
      <style>{`.print-only{display:none}.book-page{page-break-after:always; break-after:page}.book-page:last-child{page-break-after:auto; break-after:auto}.report-sheet{page-break-inside:avoid; break-inside:avoid} @media print{.no-print{display:none!important}.print-only{display:inline!important} body{background:white!important;margin:0!important}.report-sheet{box-shadow:none!important;margin:0 auto!important;width:190mm!important;padding:0!important; break-inside:avoid} @page{size:A4; margin:8mm 10mm}}`}</style>
    </div>
  )
}