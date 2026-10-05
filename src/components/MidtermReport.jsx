import { useState, useEffect } from 'react'
import { getActiveSchoolId, getClassKeyVersioned } from '../utils/storage.js'

export default function MidtermReport({ activeClass, students: propStudents, onBack }){
  const className = activeClass?.name || 'JHS 2'
  const sid = getActiveSchoolId()

  const [students, setStudents] = useState(propStudents||[])
  const [selectedSubs, setSelectedSubs] = useState([])
  const [selectedSub, setSelectedSub] = useState('')
  const [term, setTerm] = useState('Term 1')
  const [marks, setMarks] = useState(()=> {
    try{
      const key = `midterm_${sid}_${className}_${term}`
      return JSON.parse(localStorage.getItem(key)||'{}')
    }catch{ return {} }
  })
  const [search, setSearch] = useState('')

  useEffect(()=>{
    if(propStudents && propStudents.length>0){
      setStudents(propStudents)
      return
    }
    try{
      let s = localStorage.getItem(getClassKeyVersioned(className, 'students', 'v2')) || localStorage.getItem(`${sid}_students_${className}_v2`)
      if(s) setStudents(JSON.parse(s))
    }catch{}
  }, [className, sid, propStudents])

  useEffect(()=>{
    try{
      let sub = localStorage.getItem(getClassKeyVersioned(className, 'selectedSubs', 'v1')) || localStorage.getItem(`${sid}_selectedSubs_${className}_v1`)
      if(sub){
        const arr = JSON.parse(sub)
        setSelectedSubs(arr)
        if(!selectedSub && arr.length>0) setSelectedSub(arr[0])
      }
    }catch{}
  }, [className, sid])

  useEffect(()=>{
    const key = `midterm_${sid}_${className}_${term}`
    localStorage.setItem(key, JSON.stringify(marks))
  }, [marks, sid, className, term])

  const handleMarkChange = (studentId, value)=>{
    let num = Number(value)
    if(value==='' ) num = ''
    if(num!=='' && (num<0 || num>100)) return
    setMarks(prev=> ({...prev, [`${studentId}_${selectedSub}`]: num }))
  }

  const getGrade = (score)=>{
    if(score===''||score==null) return '-'
    if(score>=80) return 'A'
    if(score>=70) return 'B'
    if(score>=60) return 'C'
    if(score>=50) return 'D'
    if(score>=40) return 'E'
    return 'F'
  }

  const getRemark = (score)=>{
    if(score===''||score==null) return ''
    if(score>=80) return 'Excellent'
    if(score>=70) return 'Very Good'
    if(score>=60) return 'Good'
    if(score>=50) return 'Credit'
    if(score>=40) return 'Pass'
    return 'Needs Improvement'
  }

  const filtered = students.filter(s=> `${s.firstName} ${s.otherNames}`.toLowerCase().includes(search.toLowerCase()))

  const stats = ()=>{
    let total=0, count=0, passed=0
    filtered.forEach(s=>{
      const m = marks[`${s.id}_${selectedSub}`]
      if(m!=='' && m!=null){ total+=Number(m); count++; if(Number(m)>=50) passed++ }
    })
    return { avg: count? (total/count).toFixed(1) : 0, passed, total: count }
  }
  const s = stats()

  return (
    <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:16}}>
      <div style={{maxWidth:1200, margin:'0 auto'}}>
        <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:'800', cursor:'pointer'}}>‹ Back to {className}</button>

        <div style={{marginTop:16, background:'#151E32', border:'1px solid #2A3552', borderRadius:16, padding:16}}>
          <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, alignItems:'center'}}>
            <div>
              <h1 style={{margin:0, fontWeight:'900', fontSize:18}}>📊 CARD 2: Midterm Report - {className}</h1>
              <div style={{fontSize:11, color:'#94A3B8', marginTop:4}}>{students.length} students • {term} • Midterm marks are 30% of final</div>
            </div>
            <button onClick={()=>window.print()} style={{background:'#818CF8', color:'white', padding:'10px 18px', borderRadius:100, border:'none', fontWeight:'900', cursor:'pointer'}}>🖨️ Print Midterm Sheet</button>
          </div>

          <div style={{display:'flex', gap:10, marginTop:14, flexWrap:'wrap'}}>
            <select value={term} onChange={e=>setTerm(e.target.value)} style={{background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white'}}>
              <option>Term 1</option><option>Term 2</option><option>Term 3</option>
            </select>
            <select value={selectedSub} onChange={e=>setSelectedSub(e.target.value)} style={{background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white', minWidth:180}}>
              {selectedSubs.length===0? <option>No subjects - Go to My Subjects</option> : selectedSubs.map((sub)=>(<option key={sub} value={sub}>{sub}</option>))}
            </select>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student..." style={{background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white', flex:1, minWidth:160}}/>
          </div>

          <div style={{display:'flex', gap:8, marginTop:12}}>
            <div style={{background:'#1E1B4B', padding:'8px 14px', borderRadius:100, fontSize:11, fontWeight:'800'}}>Avg: {s.avg}%</div>
            <div style={{background:'#052E16', padding:'8px 14px', borderRadius:100, fontSize:11, fontWeight:'800', color:'#4ADE80'}}>Passed: {s.passed}/{s.total}</div>
            <div style={{background:'#422006', padding:'8px 14px', borderRadius:100, fontSize:11, fontWeight:'800', color:'#FCD34D'}}>{selectedSub||'No Subject'} - Midterm (30%)</div>
          </div>
        </div>

        <div style={{marginTop:16, background:'white', borderRadius:16, overflow:'hidden', color:'black'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
              <thead>
                <tr style={{background:'#0F172A', color:'white', textAlign:'left'}}>
                  <th style={{padding:12}}>#</th>
                  <th style={{padding:12}}>Student Name</th>
                  <th style={{padding:12}}>Midterm Mark (100%)</th>
                  <th style={{padding:12}}>Grade</th>
                  <th style={{padding:12}}>Remark</th>
                  <th style={{padding:12}}>30% Equiv</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((stu, idx)=>{
                  const key = `${stu.id}_${selectedSub}`
                  const mark = marks[key]?? ''
                  const grade = getGrade(mark)
                  const remark = getRemark(mark)
                  const equiv = mark!==''? ((Number(mark)*0.3).toFixed(1)) : '-'
                  return (
                    <tr key={stu.id} style={{borderBottom:'1px solid #E2E8F0', background: idx%2===0? 'white':'#F8FAFC'}}>
                      <td style={{padding:10, fontWeight:'700'}}>{idx+1}</td>
                      <td style={{padding:10, fontWeight:'800'}}>{stu.firstName} {stu.otherNames}</td>
                      <td style={{padding:10}}>
                        <input
                          type="number"
                          value={mark}
                          onChange={e=>handleMarkChange(stu.id, e.target.value)}
                          placeholder="0-100"
                          style={{width:90, padding:'8px', borderRadius:8, border:'1.5px solid #0F172A', fontWeight:'800', textAlign:'center'}}
                        />
                      </td>
                      <td style={{padding:10}}><span style={{background: grade==='F'?'#FEE2E2': grade==='A'?'#DCFCE7':'#FEF3C7', padding:'4px 10px', borderRadius:100, fontWeight:'900', fontSize:11}}>{grade}</span></td>
                      <td style={{padding:10, fontSize:11, color:'#475569'}}>{remark}</td>
                      <td style={{padding:10, fontWeight:'800'}}>{equiv}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length===0 && <div style={{padding:40, textAlign:'center', color:'#64748B'}}>No students found in {className}</div>}
        </div>

        <div style={{marginTop:14, background:'#1E1B4B', border:'1px solid #818CF8', borderRadius:12, padding:14}}>
          <div style={{fontWeight:'800', fontSize:12}}>💡 How Midterm Works:</div>
          <div style={{fontSize:11, color:'#A5B4FC', marginTop:6, lineHeight:1.6}}>
            • Midterm is 30% of final exam • Teacher enters marks out of 100 • System auto-converts to 30% • Will auto-merge with End of Term (70%) in Terminal Report<br/>
            • Example: Student gets 80/100 in midterm = 24/30 in final report
          </div>
        </div>
      </div>
    </div>
  )
}