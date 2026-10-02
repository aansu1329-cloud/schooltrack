import { useState, useEffect, useMemo } from 'react'
import { getActiveSchoolId, getClassKeyVersioned } from '../utils/storage.js'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday']

export default function AttendanceRegister({ activeClass, students=[], onBack }){
  const className = activeClass?.name || 'Class'
  const sid = getActiveSchoolId()
  const key = getClassKeyVersioned(className, 'attendance_weekly', 'v3')

  const [week, setWeek] = useState(1)
  const [data, setData] = useState(()=>{
    try{ const s=localStorage.getItem(key); return s? JSON.parse(s) : {} }catch{return {}}
  })

  useEffect(()=>{ localStorage.setItem(key, JSON.stringify(data)) }, [data, key])

  const getWeekData = (w)=> data[w] || { closed:false, holidays:{}, marks:{} }
  const current = getWeekData(week)
  const isClosed = current.closed
  const canOpenWeek = (w)=>{ if(w===1) return true; const prev=getWeekData(w-1); return prev.closed===true }

  const setHoliday = (day, isHoliday)=>{
    const copy={...data}; if(!copy[week]) copy[week]={closed:false, holidays:{}, marks:{}}; copy[week].holidays[day]=isHoliday; setData(copy)
  }
  const setMark = (studentId, day, value)=>{
    if(isClosed) return; if(current.holidays?.[day]) return
    const copy={...data}; if(!copy[week]) copy[week]={closed:false, holidays:{}, marks:{}}; if(!copy[week].marks[studentId]) copy[week].marks[studentId]={}; copy[week].marks[studentId][day]=value; setData(copy)
  }

  const totalBoys = students.filter(s=>(s.gender||'Boy')==='Boy').length
  const totalGirls = students.filter(s=>s.gender==='Girl').length

  const closeWeek = ()=>{
    if(isClosed) return
    const copy={...data}; if(!copy[week]) copy[week]={closed:false, holidays:{}, marks:{}}; copy[week].closed=true; copy[week].closedAt=new Date().toISOString(); setData(copy); alert(`Week ${week} closed ✅`); setWeek(week+1)
  }

  // --- MESSAGE TO PARENTS FEATURE (RESTORED) ---
  const getAbsentForDay = (day)=>{
    return students.filter(s=>{
      const m = current.marks?.[s.id]?.[day]
      return m==='A'
    })
  }
  const messageParent = (s, day)=>{
    const phone = (s.parentPhone||'').replace(/\D/g,'')
    if(!phone){ alert(`No parent phone for ${s.firstName}`); return }
    const text = `Hello ${s.parentName||'Parent'}, your ward ${s.firstName} ${s.otherNames} of ${className} was absent on ${day} Week ${week}. Please take note. From ${activeClass?.school||'School'}`
    const url = `https://wa.me/233${phone.slice(-9)}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }
  const messageAllAbsent = (day)=>{
    const abs = getAbsentForDay(day)
    if(abs.length===0){ alert(`No absent learners on ${day}`); return }
    const names = abs.map(s=> `${s.firstName} (${s.parentPhone||'no phone'})`).join(', ')
    if(confirm(`Message parents of ${abs.length} absent learners on ${day}?\n${names}\n\nWill open WhatsApp for each (bulk)`)){
      abs.forEach(s=> messageParent(s, day))
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'#0A0F1E', color:'white'}}>
      <div style={{display:'flex', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid #1E293B'}}>
        <div style={{display:'flex', gap:12, alignItems:'center'}}><button onClick={onBack} style={{width:36, height:36, borderRadius:10, background:'#151C2F', border:'1px solid #1E293B', color:'white'}}>‹</button><div><div style={{fontWeight:'900'}}>{className} Attendance — Weekly</div><div style={{fontSize:10, color:'#F59E0B'}}>P=Present A=Absent H=Holiday • Boys {totalBoys} Girls {totalGirls}</div></div></div>
        <div style={{fontSize:10, background:'#151C2F', padding:'6px 10px', borderRadius:100}}>Week {week} {isClosed?'CLOSED':''}</div>
      </div>

      <div style={{padding:'12px 16px', display:'flex', gap:8, overflowX:'auto', background:'#0F172A', borderBottom:'1px solid #1E293B'}}>
        {Array.from({length:15}, (_,i)=>i+1).map(w=>{
          const canOpen=canOpenWeek(w); const wd=getWeekData(w)
          return <button key={w} disabled={!canOpen} onClick={()=>canOpen&&setWeek(w)} style={{padding:'8px 14px', borderRadius:100, border:'1px solid', borderColor: week===w?'#F59E0B':'#1E293B', background: week===w?'#F59E0B': wd.closed?'#065F46':'#151C2F', color: week===w?'black':'white', fontWeight:'800', fontSize:12, opacity: canOpen?1:0.4}}>{`W${w}`} {wd.closed?'✓':''}</button>
        })}
      </div>

      <div style={{padding:'12px 16px', background:'#11192E', borderBottom:'1px solid #1E293B'}}>
        <div style={{fontSize:11, fontWeight:'800', color:'#FBBF24', marginBottom:8}}>MARK HOLIDAY ON TOP + MESSAGE ABSENT PARENTS (RESTORED)</div>
        <div style={{display:'grid', gridTemplateColumns:'140px repeat(5,1fr)', gap:8}}>
          <div style={{fontSize:11, color:'#94A3B8'}}>Holiday?</div>
          {DAYS.map(d=>(
            <div key={d} style={{display:'flex', flexDirection:'column', gap:4}}>
              <label style={{display:'flex', gap:6, alignItems:'center', background: current.holidays?.[d]? '#7F1D1D':'#151C2F', border:'1px solid #2A3552', borderRadius:8, padding:'6px 8px'}}>
                <input type="checkbox" checked={!!current.holidays?.[d]} disabled={isClosed} onChange={e=>setHoliday(d, e.target.checked)} />
                <span style={{fontSize:11, fontWeight:'700'}}>{d.slice(0,3)} {current.holidays?.[d]? 'H':''}</span>
              </label>
              <button onClick={()=>messageAllAbsent(d)} style={{background:'#25D366', color:'white', border:'none', borderRadius:6, padding:'4px 6px', fontSize:9, fontWeight:'800', cursor:'pointer'}}>📱 Bulk {d.slice(0,3)} Absent ({getAbsentForDay(d).length})</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{overflowX:'auto'}}><div style={{minWidth:780}}>
        <div style={{display:'grid', gridTemplateColumns:'200px repeat(5,1fr)', background:'#1E293B', padding:'10px 0'}}>
          <div style={{padding:'0 16px', fontSize:11, fontWeight:'800', color:'#94A3B8'}}>Student</div>
          {DAYS.map(d=> <div key={d} style={{textAlign:'center', fontSize:11, fontWeight:'800'}}>{d}<div style={{fontSize:9, color:'#94A3B8'}}>{current.holidays?.[d]? 'HOLIDAY':'P/A + Message'}</div></div>)}
        </div>
        {students.map(s=>{
          const marks=current.marks?.[s.id]||{}
          return (
            <div key={s.id} style={{display:'grid', gridTemplateColumns:'200px repeat(5,1fr)', borderBottom:'1px solid #1E293B', background:'#0F172A', padding:'6px 0', alignItems:'center'}}>
              <div style={{padding:'0 12px', display:'flex', gap:8, alignItems:'center'}}>
                <div style={{width:26, height:26, borderRadius:100, background: s.gender==='Girl'? '#831843':'#1E293B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11}}>{s.gender==='Girl'?'👧':'👦'}</div>
                <div><div style={{fontSize:12, fontWeight:'700'}}>{s.firstName} {s.otherNames}</div><div style={{fontSize:9, color:'#94A3B8'}}>{s.parentPhone||'No phone'} • {s.gender}</div></div>
              </div>
              {DAYS.map(d=>{
                const isHol=current.holidays?.[d]; const val=marks[d]||''
                return (
                  <div key={d} style={{display:'flex', justifyContent:'center', gap:3, flexDirection:'column', alignItems:'center'}}>
                    {isHol? <div style={{background:'#7F1D1D', color:'#FECACA', padding:'6px 12px', borderRadius:8, fontSize:10, fontWeight:'800'}}>H</div> :
                      <div style={{display:'flex', gap:4, alignItems:'center'}}>
                        <button disabled={isClosed} onClick={()=>setMark(s.id,d,'P')} style={{width:34, height:30, borderRadius:8, border:'1px solid', borderColor: val==='P'? '#10B981':'#2A3552', background: val==='P'? '#10B981':'#151C2F', color:'white', fontWeight:'800'}}>P</button>
                        <button disabled={isClosed} onClick={()=>setMark(s.id,d,'A')} style={{width:34, height:30, borderRadius:8, border:'1px solid', borderColor: val==='A'? '#EF4444':'#2A3552', background: val==='A'? '#7F1D1D':'#151C2F', color:'white', fontWeight:'800'}}>A</button>
                        {val==='A' && <button onClick={()=>messageParent(s,d)} style={{background:'#25D366', border:'none', borderRadius:6, padding:'4px 6px', fontSize:10, cursor:'pointer'}}>📱</button>}
                      </div>
                    }
                  </div>
                )
              })}
            </div>
          )
        })}
      </div></div>

      <div style={{padding:16, display:'flex', justifyContent:'space-between', background:'#0F172A', borderTop:'1px solid #1E293B', position:'sticky', bottom:0}}>
        <div style={{fontSize:11, color:'#94A3B8'}}>Week {week} • Boys {totalBoys} Girls {totalGirls} • Message restored: Individual 📱 + Bulk per day</div>
        <button disabled={isClosed} onClick={closeWeek} style={{background: isClosed?'#1E293B':'#F59E0B', color: isClosed?'#64748B':'black', padding:'10px 20px', borderRadius:100, border:'none', fontWeight:'900'}}>{isClosed? `Week ${week} Closed ✓`:`Close Week ${week}`}</button>
      </div>
    </div>
  )
}