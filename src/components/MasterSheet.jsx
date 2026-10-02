import { useState, useMemo } from 'react'
import { getActiveSchoolId, getClassKeyVersioned } from '../utils/storage.js'

export default function MasterSheet({ onBack, activeClass }){
  const className = activeClass?.name || '5A'
  const sid = getActiveSchoolId()

  // SCHOOL ISOLATED KEYS - NO MORE 5A FALLBACK
  const studentsKey = getClassKeyVersioned(className, 'students', 'v2')
  const subsKey = getClassKeyVersioned(className, 'selectedSubs', 'v1')
  const marksKey = `${sid}_marks_${className}`
  const activeKey = `${sid}_activeAssessment_${className}`

  const students = useMemo(()=>{
    try{
      const s = localStorage.getItem(studentsKey)
      const p = s? JSON.parse(s) : []
      return p.map(x=> ({...x, name: x.name || `${x.firstName||''} ${x.otherNames||''}`.trim()})).filter(x=>x.name)
    }catch{ return [] }
  }, [studentsKey])

  const subjects = useMemo(()=>{
    try{
      const sel = JSON.parse(localStorage.getItem(subsKey)||'null')
      if(sel && sel.length>0) {
        // ONLY your selected 4, deduped, no 16
        const seen=new Set(); const out=[]
        sel.forEach(raw=>{
          let n = typeof raw==='string'? raw : (raw.name||raw.subject||'')
          n=n.trim(); if(!n) return
          const k=n.toLowerCase()
          if(!seen.has(k)){ seen.add(k); out.push(n) }
        })
        return out
      }
    }catch{}
    return []
  }, [subsKey])

  const activeAss = useMemo(()=>{
    try{ return JSON.parse(localStorage.getItem(activeKey)||'null') }catch{ return null }
  }, [activeKey])

  const allMarks = useMemo(()=>{
    try{ return JSON.parse(localStorage.getItem(marksKey)||'{}') }catch{ return {} }
  }, [marksKey])

  const data = useMemo(()=>{
    if(!activeAss ||!students.length || subjects.length===0) return []
    const marksForAss = allMarks[activeAss.id] || {}
    let rows = students.map(s=>{
      let totalOverall = 0
      let scores = {}
      subjects.forEach(sub=>{
        const m = marksForAss[s.name]?.[sub] || {cs:0, ex:0}
        const cs = Number(m.cs)||0
        const ex = Number(m.ex)||0
        const cex = ex * (activeAss.examScore/100)
        const tot = cs + cex
        scores[sub] = tot
        totalOverall += tot
      })
      return { name: s.name, id: s.id, scores, overall: totalOverall }
    })
    rows.sort((a,b)=> b.overall - a.overall)
    return rows.map((r,i)=> ({...r, rank: i+1, pos: `${i+1}${i+1===1?'st':i+1===2?'nd':i+1===3?'rd':'th'}`}))
  }, [students, subjects, allMarks, activeAss])

  if(subjects.length===0) return (
    <div style={{minHeight:'100vh', background:'#FFFBEB', padding:20}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <button onClick={onBack} style={{background:'white', border:'1.5px solid #FDE68A', padding:'8px 16px', borderRadius:100, fontWeight:'700', color:'#78350F'}}>‹ Back</button>
        <div style={{marginTop:40, background:'white', border:'1.5px solid #F59E0B', borderRadius:16, padding:30, textAlign:'center'}}>
          <div style={{fontWeight:'900', color:'#92400E'}}>No Subjects Selected for {className}</div>
          <div style={{fontSize:11, color:'#92400E', marginTop:6}}>Go to My Subjects and select 4 subjects. Broadsheet will show ONLY those 4, not 16.</div>
        </div>
      </div>
    </div>
  )

  if(!activeAss) return (
    <div style={{minHeight:'100vh', background:'#FFFBEB', padding:20}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <button onClick={onBack} style={{background:'white', border:'1.5px solid #FDE68A', padding:'8px 16px', borderRadius:100, fontWeight:'700', color:'#78350F'}}>‹ Back</button>
        <div style={{marginTop:40, background:'white', border:'1.5px solid #FDE68A', borderRadius:16, padding:30, textAlign:'center', color:'#92400E'}}>
          No ACTIVE assessment for {className}.<br/>Go to Assessments and click 💾 Finish to set active. Will show {subjects.length} subjects: {subjects.join(', ')}
        </div>
      </div>
    </div>
  )

  if(students.length===0) return (
    <div style={{minHeight:'100vh', background:'#FFFBEB', padding:20}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <button onClick={onBack} style={{background:'white', border:'1.5px solid #FDE68A', padding:'8px 16px', borderRadius:100, fontWeight:'700'}}>‹ Back</button>
        <div style={{marginTop:30, background:'#7F1D1D', borderRadius:16, padding:20, textAlign:'center', color:'#FECACA'}}>No learner in {className} for this school ({sid})</div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#FFFBEB', color:'#1E293B'}}>
      <div style={{background:'#FFFAEB', borderBottom:'2px solid #FDE68A', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <button onClick={onBack} style={{width:40,height:40,borderRadius:12,background:'white', border:'1.5px solid #FDE68A', color:'#78350F', fontWeight:'800'}}>‹</button>
          <div><div style={{fontWeight:'900', color:'#78350F'}}>📊 Master Sheet - {className} - {subjects.length} Subjects ONLY</div><div style={{fontSize:11,color:'#92400E'}}>{activeAss.term} • {activeAss.assessmentType} • {students.length} learner(s) • {activeAss.academicYear} • {subjects.join(', ')}</div></div>
        </div>
        <button onClick={()=>window.print()} style={{background:'#92400E',color:'white',padding:'10px 16px',borderRadius:100,border:'none',fontWeight:'800'}}>🖨️ Print / PDF</button>
      </div>

      <div style={{maxWidth:1200, margin:'0 auto', padding:20}}>
        <div style={{background:'white', border:'1.5px solid #FDE68A', borderRadius:18, overflowX:'auto'}}>
          <div style={{minWidth:700}}>
            <div style={{display:'flex', gap:4, background:'#FFFBEB', padding:'12px 10px', fontSize:10, fontWeight:'900', color:'#78350F', borderBottom:'1.5px solid #FDE68A'}}>
              <div style={{minWidth:160}}>NAME</div>
              {subjects.map(s=> <div key={s} style={{minWidth:75, textAlign:'center'}}>{s.slice(0,12)}</div>)}
              <div style={{minWidth:65, textAlign:'center'}}>OVERALL</div>
              <div style={{minWidth:45, textAlign:'center'}}>POS</div>
            </div>
            {data.map(r=> (
              <div key={r.id} style={{display:'flex', gap:4, padding:'12px 10px', borderTop:'1px solid #FEF3C7', fontSize:12}}>
                <div style={{minWidth:160, fontWeight:'700'}}>{r.name}</div>
                {subjects.map(sub=> <div key={sub} style={{minWidth:75, textAlign:'center', color:'#92400E'}}>{r.scores[sub]?.toFixed(1)}</div>)}
                <div style={{minWidth:65, textAlign:'center', fontWeight:'800'}}>{r.overall.toFixed(1)}</div>
                <div style={{minWidth:45, textAlign:'center', color:'#92400E', fontWeight:'800'}}>{r.pos}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginTop:10, fontSize:10, color:'#92400E', textAlign:'center'}}>Showing ONLY {subjects.length} subjects from My Subjects • Learner count: {students.length} • Same calculation as before: CS + EX*(exam%/100)</div>
      </div>
    </div>
  )
}