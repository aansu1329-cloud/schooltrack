import { useState, useEffect } from 'react'
import { getActiveSchoolId } from '../utils/storage.js'

export default function WorkOutputChart({ onBack }){
  const sid = getActiveSchoolId() || 'SCHOOL'
  const schoolName = (()=>{ try{ const u=JSON.parse(localStorage.getItem('currentUser_v3')||'{}'); return u.school||u.schoolName||sid }catch{return sid} })()
  const [teachers, setTeachers] = useState([])
  const [term, setTerm] = useState(()=> localStorage.getItem(`${sid}_work_term`)||'TERM ONE (1)')
  const [year, setYear] = useState(()=> localStorage.getItem(`${sid}_work_year`)||'2026/2027')
  const [numWeeks, setNumWeeks] = useState(()=> parseInt(localStorage.getItem(`${sid}_work_weeks`)||'14'))
  const [marks, setMarks] = useState(()=>{ try{ return JSON.parse(localStorage.getItem(`${sid}_work_output`)||'{}')}catch{return {}} })

  useEffect(()=>{
    try{
      let list=[]
      const keys=[`${sid}_teachers`,'teachers']
      for(let k of keys){ const v=localStorage.getItem(k); if(v){ const arr=JSON.parse(v); if(arr.length>0){ list=arr; break } } }
      if(list.length===0){ const cu=JSON.parse(localStorage.getItem('currentUser_v3')||'{}'); if(cu.name) list=[{id:1,name:cu.name}] }
      setTeachers(list)
    }catch{}
  },[sid])

  useEffect(()=>localStorage.setItem(`${sid}_work_term`, term),[term,sid])
  useEffect(()=>localStorage.setItem(`${sid}_work_year`, year),[year,sid])
  useEffect(()=>localStorage.setItem(`${sid}_work_weeks`, String(numWeeks)),[numWeeks,sid])
  useEffect(()=>localStorage.setItem(`${sid}_work_output`, JSON.stringify(marks)),[marks,sid])

  const weeks=Array.from({length:numWeeks},(_,i)=>i+1)
  const getVal=(tid,w)=> marks[`${term}_${tid}`]?.[w] || ''
  const setVal=(tid,w,val)=>{ const key=`${term}_${tid}`; setMarks(prev=>({...prev,[key]:{...(prev[key]||{}),[w]:val}})) }

  // AUTO CALC TOTAL
  const getTotal = (tid) => {
    let total = 0
    weeks.forEach(w=>{
      const v = parseInt(getVal(tid,w)||0)
      if(!isNaN(v)) total+=v
    })
    return total
  }
  const getAverage = (tid) => {
    const total = getTotal(tid)
    let filled = 0
    weeks.forEach(w=>{ if(getVal(tid,w)!=='') filled++ })
    return filled>0? (total/filled).toFixed(1) : 0
  }

  const handlePrint=()=>{
    const rows=teachers.map((t,i)=>{
      const cols=weeks.map(w=>`<td style="border:1px solid black; padding:8px; text-align:center; font-weight:700;">${getVal(t.id,w)||'-'}</td>`).join('')
      return `<tr><td style="border:1px solid black; padding:6px; text-align:center;">${i+1}</td><td style="border:1px solid black; padding:6px; text-align:left; font-weight:600;">${t.name}</td>${cols}<td style="border:1px solid black; padding:6px; text-align:center; font-weight:900; background:#FEF9C3;">${getTotal(t.id)}</td><td style="border:1px solid black; padding:6px; text-align:center; font-weight:700;">${getAverage(t.id)}</td></tr>`
    }).join('')
    const headers=weeks.map(w=>`<th style="border:1px solid black; padding:6px; font-size:10px; text-align:center;">W ${w}</th>`).join('')
    const html=`<html><head><title>Work Output</title><style>body{font-family:Arial; padding:20px;}.h{text-align:center; font-weight:900; font-size:14px; line-height:1.4; text-transform:uppercase;} table{border-collapse:collapse; width:100%; margin-top:14px;} th,td{font-size:12px;} @media print{@page{size:landscape; margin:10mm}}</style></head><body><div class="h">GHANA EDUCATION SERVICE<br/>${schoolName.toUpperCase()}<br/>TEACHERS' OUTPUT OF WORK CHART<br/>${term} - YEAR ${year}</div><table><thead><tr><th style="border:1px solid black; padding:6px; text-align:center;">S/N</th><th style="border:1px solid black; padding:6px; text-align:center;">NAMES OF TEACHERS</th>${headers}<th style="border:1px solid black; padding:6px; text-align:center; background:#FEF9C3;">TOTAL</th><th style="border:1px solid black; padding:6px; text-align:center;">AVG</th></tr></thead><tbody>${rows}</tbody></table><div style="margin-top:10px; font-size:11px; text-align:center;">TOTAL = Sum of exercises per teacher | AVG = Average per week</div><script>window.print()</script></body></html>`
    const win=window.open('','','width=1400,height=900'); win.document.write(html); win.document.close()
  }

  return (
    <div style={{minHeight:'100vh', background:'#F3F4F6', color:'black'}}>
      <div style={{background:'#0B1222', color:'white', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}><button onClick={onBack} style={{width:36,height:36,borderRadius:10,background:'#1A2236',border:'1px solid #2A3552',color:'white'}}>‹</button><div style={{fontWeight:'800', textAlign:'center'}}>Work Output Chart - CENTER + TOTAL</div></div>
        <button onClick={handlePrint} style={{background:'#22C55E', color:'white', border:'none', padding:'10px 16px', borderRadius:100, fontWeight:'800'}}>🖨️ Print</button>
      </div>

      <div style={{maxWidth:1500, margin:'0 auto', padding:16, background:'white'}}>
        <div style={{textAlign:'center', fontWeight:'900', fontSize:14, lineHeight:1.4, textTransform:'uppercase', background:'#F8FAFC', border:'1px solid black', padding:14}}>
          GHANA EDUCATION SERVICE<br/>
          {schoolName.toUpperCase()}<br/>
          TEACHERS' OUTPUT OF WORK CHART<br/>
          {term} - YEAR {year}
        </div>

        <div style={{marginTop:12, display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:12}}>
          <select value={term} onChange={e=>setTerm(e.target.value)} style={{padding:'8px 12px', borderRadius:8, border:'1px solid #CBD5E1', fontWeight:'700'}}><option>TERM ONE (1)</option><option>TERM TWO (2)</option><option>TERM THREE (3)</option></select>
          <select value={year} onChange={e=>setYear(e.target.value)} style={{padding:'8px 12px', borderRadius:8, border:'1px solid #CBD5E1', fontWeight:'700'}}><option>2026/2027</option><option>2025/2026</option></select>
          <select value={numWeeks} onChange={e=>setNumWeeks(parseInt(e.target.value))} style={{padding:'8px 12px', borderRadius:8, border:'1px solid #22C55E', fontWeight:'700'}}><option value={11}>11 Weeks</option><option value={12}>12 Weeks</option><option value={13}>13 Weeks</option><option value={14}>14 Weeks</option><option value={15}>15 Weeks</option></select>
        </div>

        <div style={{marginTop:16, overflowX:'auto', border:'2px solid black'}}>
          <table style={{borderCollapse:'collapse', width:'100%', minWidth:1200}}>
            <thead>
              <tr style={{background:'#F1F5F9'}}>
                <th style={{border:'1px solid black', padding:'10px', width:40, textAlign:'center'}}>S/N</th>
                <th style={{border:'1px solid black', padding:'10px', width:220, textAlign:'center'}}>NAMES OF TEACHERS</th>
                {weeks.map(w=> <th key={w} style={{border:'1px solid black', padding:'8px', fontSize:11, textAlign:'center'}}>W {w}</th>)}
                <th style={{border:'1px solid black', padding:'10px', width:70, textAlign:'center', background:'#FEF9C3'}}>TOTAL</th>
                <th style={{border:'1px solid black', padding:'10px', width:60, textAlign:'center', background:'#DBEAFE'}}>AVG</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t,i)=> (
                <tr key={t.id} style={{background: i%2===0? 'white' : '#F8FAFC'}}>
                  <td style={{border:'1px solid black', padding:'10px', textAlign:'center', fontWeight:'700'}}>{i+1}</td>
                  <td style={{border:'1px solid black', padding:'10px', fontWeight:'600', textTransform:'uppercase', fontSize:12, textAlign:'left'}}>{t.name}</td>
                  {weeks.map(w=> (
                    <td key={w} style={{border:'1px solid black', padding:0, textAlign:'center', background: getVal(t.id,w)?'#FEF9C3':'white'}}>
                      <input type="number" value={getVal(t.id,w)} onChange={e=>setVal(t.id,w,e.target.value)} placeholder="-" style={{width:52, height:38, border:'none', textAlign:'center', fontWeight:'800', fontSize:14, background:'transparent', outline:'none'}}/>
                    </td>
                  ))}
                  <td style={{border:'1px solid black', padding:'10px', textAlign:'center', fontWeight:'900', background:'#FEF9C3', fontSize:14}}>{getTotal(t.id)}</td>
                  <td style={{border:'1px solid black', padding:'10px', textAlign:'center', fontWeight:'700', background:'#DBEAFE'}}>{getAverage(t.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{marginTop:10, fontSize:11, textAlign:'center', background:'#EFF6FF', border:'1px solid #93C5FD', padding:10, borderRadius:8}}>
          <b style={{color:'#1E40AF'}}>AUTO CALCULATIONS:</b> TOTAL = Sum of all weeks • AVG = TOTAL ÷ Weeks filled • Yellow = Filled • Prints center aligned like GES paper
        </div>
      </div>
    </div>
  )
}