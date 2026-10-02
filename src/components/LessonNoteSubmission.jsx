import { useState, useEffect } from 'react'
import { getActiveSchoolId } from '../utils/storage.js'

export default function LessonNoteSubmission({ onBack }){
  const sid = getActiveSchoolId() || 'SCHOOL'
  const schoolName = (()=>{ try{ const u=JSON.parse(localStorage.getItem('currentUser_v3')||'{}'); return u.school||u.schoolName||sid }catch{return sid} })()

  const [teachers, setTeachers] = useState([])
  const [term, setTerm] = useState(()=> localStorage.getItem(`${sid}_lesson_term`)||'TERM ONE (1)')
  const [year, setYear] = useState(()=> localStorage.getItem(`${sid}_lesson_year`)||'2026/2027')
  const [numWeeks, setNumWeeks] = useState(()=> parseInt(localStorage.getItem(`${sid}_lesson_weeks`)||'14'))
  const [data, setData] = useState(()=>{ try{ return JSON.parse(localStorage.getItem(`${sid}_lesson_notes`)||'{}')}catch{return {}} })

  useEffect(()=>{
    try{
      // try all possible teacher keys - to make it NEVER BLANK
      let list = []
      const keysToTry = [`${sid}_teachers`, 'teachers', `${sid}_my_teachers`, 'my_teachers']
      for(let k of keysToTry){
        const v = localStorage.getItem(k)
        if(v){ const arr=JSON.parse(v); if(arr.length>0){ list=arr; break } }
      }
      // also try currentUser if head
      if(list.length===0){
        const cu = JSON.parse(localStorage.getItem('currentUser_v3')||'{}')
        if(cu.name) list=[{id:1, name:cu.name}]
      }
      setTeachers(list)
    }catch{}
  }, [sid])

  useEffect(()=> localStorage.setItem(`${sid}_lesson_term`, term), [term, sid])
  useEffect(()=> localStorage.setItem(`${sid}_lesson_year`, year), [year, sid])
  useEffect(()=> localStorage.setItem(`${sid}_lesson_weeks`, String(numWeeks)), [numWeeks, sid])
  useEffect(()=> localStorage.setItem(`${sid}_lesson_notes`, JSON.stringify(data)), [data, sid])

  const weeks = Array.from({length:numWeeks}, (_,i)=>i+1)
  const getVal = (tid, w) => data[`${term}_${tid}`]?.[w] || ''
  const setVal = (tid, w, val) => {
    const key = `${term}_${tid}`
    setData(prev=> ({...prev, [key]: {...(prev[key]||{}), [w]: val }}))
  }

  const handlePrint = ()=>{
    const rows = teachers.map((t,i)=>{
      const cols = weeks.map(w=>{
        const v=getVal(t.id,w)||'-'
        let bg='#fff'; if(v==='/') bg='#DCFCE7'; if(v==='X') bg='#FEE2E2'; if(v==='O') bg='#FEF9C3'
        return `<td style="border:1px solid black; padding:6px; text-align:center; font-weight:800; background:${bg}">${v}</td>`
      }).join('')
      return `<tr><td style="border:1px solid black; padding:6px; text-align:center;">${i+1}</td><td style="border:1px solid black; padding:6px; text-align:left; font-weight:600;">${t.name}</td>${cols}</tr>`
    }).join('')
    const headers = weeks.map(w=> `<th style="border:1px solid black; padding:6px; font-size:10px;">W ${w}</th>`).join('')
    const html = `<html><head><title>Lesson Notes</title><style>body{font-family:Arial; padding:20px;}.h{text-align:right; font-weight:900; line-height:1.3; text-transform:uppercase; font-size:13px;} table{border-collapse:collapse; width:100%; margin-top:14px;} @media print{@page{size:landscape}}</style></head><body><div class="h">GHANA EDUCATION SERVICE<br/>${schoolName.toUpperCase()}<br/>LESSON NOTES - SUBMISSION CHART<br/>${term}<br/>YEAR ${year}</div><table><thead><tr><th>S/N</th><th style="width:220px; text-align:left; padding-left:8px;">NAMES OF TEACHERS</th>${headers}</tr></thead><tbody>${rows}</tbody></table><div style="margin-top:8px; font-size:10px;">/ = Submitted, X = Not Submitted, O = No Lesson Note • Printed ${new Date().toLocaleDateString()}</div><script>window.print()</script></body></html>`
    const win=window.open('','','width=1400,height=900'); win.document.write(html); win.document.close()
  }

  if(teachers.length===0){
    return (
      <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:20}}>
        <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:'700'}}>‹ Back</button>
        <div style={{marginTop:20, background:'#1A2236', padding:20, borderRadius:16}}>No teachers found. Go to Add Staff and add teachers first. Current School ID: {sid}</div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', background:'#F3F4F6', color:'black'}}>
      <div style={{background:'#0B1222', color:'white', padding:'12px 16px', display:'flex', justifyContent:'space-between'}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}><button onClick={onBack} style={{width:36,height:36, borderRadius:10, background:'#1A2236', border:'1px solid #2A3552', color:'white'}}>‹</button><div style={{fontWeight:'800'}}>Lesson Notes Submission - {teachers.length} teachers</div></div>
        <button onClick={handlePrint} style={{background:'#22C55E', color:'white', border:'none', padding:'10px 16px', borderRadius:100, fontWeight:'800'}}>🖨️ Print Like Paper</button>
      </div>
      <div style={{maxWidth:1400, margin:'0 auto', padding:16, background:'white'}}>
        <div style={{textAlign:'right', fontWeight:'900', fontSize:13, lineHeight:1.4, textTransform:'uppercase'}}>GHANA EDUCATION SERVICE<br/>{schoolName.toUpperCase()}<br/>LESSON NOTES - SUBMISSION CHART<br/>{term}<br/>YEAR {year}</div>
        <div style={{marginTop:12, display:'flex', gap:10, flexWrap:'wrap', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:12}}>
          <select value={term} onChange={e=>setTerm(e.target.value)} style={{padding:'8px 12px', borderRadius:8, border:'1px solid #CBD5E1', fontWeight:'700'}}><option>TERM ONE (1)</option><option>TERM TWO (2)</option><option>TERM THREE (3)</option></select>
          <select value={year} onChange={e=>setYear(e.target.value)} style={{padding:'8px 12px', borderRadius:8, border:'1px solid #CBD5E1', fontWeight:'700'}}><option>2026/2027</option><option>2025/2026</option></select>
          <select value={numWeeks} onChange={e=>setNumWeeks(parseInt(e.target.value))} style={{padding:'8px 12px', borderRadius:8, border:'1px solid #22C55E', fontWeight:'700'}}><option value={11}>11 Weeks</option><option value={12}>12 Weeks</option><option value={13}>13 Weeks</option><option value={14}>14 Weeks</option><option value={15}>15 Weeks</option></select>
          <div style={{fontSize:11, background:'#F1F5F9', padding:'8px 12px', borderRadius:8}}>/ = Submitted | X = Not | O = No note</div>
        </div>
        <div style={{marginTop:16, overflowX:'auto', border:'2px solid black'}}>
          <table style={{borderCollapse:'collapse', width:'100%', minWidth:1000}}>
            <thead><tr><th style={{border:'1px solid black', padding:'8px', width:30}}>S/N</th><th style={{border:'1px solid black', padding:'8px', width:220, textAlign:'left'}}>NAMES OF TEACHERS</th>{weeks.map(w=> <th key={w} style={{border:'1px solid black', padding:'8px', fontSize:11}}>W {w}</th>)}</tr></thead>
            <tbody>{teachers.map((t,i)=> <tr key={t.id}><td style={{border:'1px solid black', padding:'8px', textAlign:'center'}}>{i+1}</td><td style={{border:'1px solid black', padding:'8px', fontWeight:'600', textTransform:'uppercase', fontSize:12}}>{t.name}</td>{weeks.map(w=>{ const v=getVal(t.id,w); let bg='white'; if(v==='/') bg='#DCFCE7'; if(v==='X') bg='#FEE2E2'; if(v==='O') bg='#FEF9C3'; return <td key={w} style={{border:'1px solid black', padding:2, background:bg, textAlign:'center'}}><select value={v} onChange={e=>setVal(t.id,w,e.target.value)} style={{width:48, height:32, border:'none', textAlign:'center', fontWeight:'800', background:'transparent'}}><option value="">-</option><option value="/">/</option><option value="X">X</option><option value="O">O</option></select></td>})}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}