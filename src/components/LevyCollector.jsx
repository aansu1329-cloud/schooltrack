import { useState, useEffect, useMemo } from 'react'
import { getActiveSchoolId, getClassKeyVersioned } from '../utils/storage.js'

const GROUPS = {
  A:{keys:['KG','NURSERY']}, B:{keys:['1','2','3']}, C:{keys:['4','5','6']}
}
function getGroup(className){
  const name = className.toUpperCase()
  if(GROUPS.A.keys.some(k=>name.includes(k))) return 'A'
  if(GROUPS.B.keys.some(k=>name.includes(k)) &&!name.includes('4') &&!name.includes('5') &&!name.includes('6')) {
    if(/CLASS\s*[1-3]\b/.test(name) || /\b[1-3][A-Z]?\b/.test(name)) return 'B'
  }
  if(['4','5','6'].some(k=> name.includes(k))) return 'C'
  return 'C'
}

export default function LevyCollector({ activeClass, onBack }){
  const className = activeClass?.name || '5A'
  const sid = getActiveSchoolId()

  // FIXED: Use correct versioned key with School ID
  const studentsKey = getClassKeyVersioned(className, 'students', 'v2')
  const fallbackKey1 = `${sid}_students_${className}_v2`
  const fallbackKey2 = `students_${className}_v2`

  const studentsRaw = useMemo(()=>{
    try{
      let raw = localStorage.getItem(studentsKey)
      if(!raw) raw = localStorage.getItem(fallbackKey1)
      if(!raw) raw = localStorage.getItem(fallbackKey2)
      if(!raw) raw = localStorage.getItem('students_5A_v2')
      return JSON.parse(raw||'[]')
    }catch{ return [] }
  }, [studentsKey, fallbackKey1, fallbackKey2])

  const students = studentsRaw.map(s=> ({...s, fullName: `${s.firstName||''} ${s.otherNames||''}`.trim()|| s.name || 'Unknown'}))

  const config = JSON.parse(localStorage.getItem('levy_config_v1')||'{}')
  const group = getGroup(className)
  const items = config[group]?.items || []
  const totalLevy = items.reduce((s,i)=> s+ Number(i.amount||0),0)
  const term = config.term || 'Term 1'
  const year = config.year || '2025/2026'
  const storageKey = `levy_payments_${sid}_${className}_${term}_${year}`

  const [payments, setPayments] = useState(()=> {
    try{ return JSON.parse(localStorage.getItem(storageKey)||'{}') }catch{ return {} }
  })
  const [selectedId, setSelectedId] = useState(students[0]?.id||null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Cash')

  useEffect(()=> localStorage.setItem(storageKey, JSON.stringify(payments)), [payments, storageKey])
  useEffect(()=> { if(students.length>0 &&!selectedId) setSelectedId(students[0].id) }, [students, selectedId])

  const selectedStudent = students.find(s=>String(s.id)===String(selectedId))
  const curPaid = payments[selectedId]?.paid || 0
  const balance = totalLevy - curPaid

  const addPayment = () => {
    const val = Number(amount)
    if(!val || val<=0) return alert('Enter valid amount')
    if(curPaid + val > totalLevy) return alert(`Cannot exceed total GHS ${totalLevy}. Balance is ${balance}`)
    const newPayments = {...payments}
    if(!newPayments[selectedId]) newPayments[selectedId]={paid:0, history:[]}
    newPayments[selectedId].paid += val
    newPayments[selectedId].history = [...(newPayments[selectedId].history||[]), {amount:val, date:new Date().toLocaleString(), method}]
    setPayments(newPayments)
    setAmount('')
  }

  const stats = useMemo(()=> {
    let collected=0, owing=0, full=0
    students.forEach(s=>{ const p=payments[s.id]?.paid||0; collected+=p; if(p>=totalLevy) full++; else owing+= (totalLevy-p) })
    return {collected, owing, full, totalDue: students.length*totalLevy}
  }, [payments, totalLevy, students])

  if(students.length===0){
    return (
      <div style={{minHeight:'100vh', background:'#F1F5F9', padding:20}}>
        <button onClick={onBack} style={{background:'#0F172A', color:'white', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:800}}>‹ Back</button>
        <div style={{background:'white', padding:40, borderRadius:12, textAlign:'center', marginTop:20}}>
          <div style={{fontSize:40}}>👨‍🎓</div>
          <div style={{fontWeight:900, marginTop:10}}>No students in {className}</div>
          <div style={{fontSize:12, color:'#64748B', marginTop:6}}>Storage Key checked: {studentsKey}<br/>Go to Students page and add students first!</div>
        </div>
      </div>
    )
  }

  return(
    <div style={{minHeight:'100vh', background:'#F1F5F9', padding:8, fontFamily:'Inter'}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        {onBack && (
          <button onClick={onBack} style={{background:'#0F172A', color:'white', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:800, fontSize:12, marginBottom:8, cursor:'pointer'}}>
            ‹ Back to Class
          </button>
        )}
        <div style={{background:'white', borderRadius:12, padding:12, marginBottom:8, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
          <div><div style={{fontWeight:900, fontSize:16}}>{className} - Levy Collector FIXED ✓ {students.length} Students Loaded</div><div style={{fontSize:11, color:'#64748B'}}>{term} {year} • Group {group} • Total: GHS {totalLevy} {items.map(i=> `${i.name}:${i.amount}`).join(' + ')}</div></div>
          <div style={{display:'flex', gap:6, fontSize:11}}><div style={{background:'#DCFCE7', padding:'6px 10px', borderRadius:100, fontWeight:800}}>Collected: GHS {stats.collected}</div><div style={{background:'#FEE2E2', padding:'6px 10px', borderRadius:100, fontWeight:800}}>Owing: GHS {stats.owing}</div><div style={{background:'#0F172A', color:'white', padding:'6px 10px', borderRadius:100, fontWeight:800}}>{stats.full}/{students.length} Paid</div></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:8}}>
          <div style={{background:'white', borderRadius:12, padding:8, maxHeight:'85vh', overflowY:'auto'}}>
            {students.map(s=>{
              const p=payments[s.id]?.paid||0
              const bal=totalLevy-p
              const status= bal<=0? 'FULL' : p>0? 'PART' : 'OWING'
              const color= status==='FULL'? '#16A34A' : status==='PART'? '#D97706' : '#DC2626'
              return <div key={s.id} onClick={()=>setSelectedId(s.id)} style={{padding:8, borderRadius:8, border:String(selectedId)===String(s.id)?'2px solid #0F172A':'1px solid #E2E8F0', marginBottom:6, cursor:'pointer', background:String(selectedId)===String(s.id)?'#F8FAFC':'white'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><div style={{fontWeight:800, fontSize:12}}>{s.fullName}</div><div style={{fontSize:9, fontWeight:900, color, background:color+'20', padding:'2px 6px', borderRadius:100}}>{status}</div></div>
                <div style={{fontSize:11, marginTop:2}}>Paid: <b>{p}</b> | Bal: <b style={{color:bal>0?'#DC2626':'#16A34A'}}>{bal}</b></div>
                <div style={{height:4, background:'#E2E8F0', borderRadius:10, marginTop:4}}><div style={{width:`${totalLevy? Math.min(100, (p/totalLevy)*100):0}%`, height:'100%', background:color, borderRadius:10}}></div></div>
              </div>
            })}
          </div>

          <div style={{background:'white', borderRadius:12, padding:12}}>
            {!selectedStudent? <div>Select student</div> : <>
              <div style={{fontWeight:900, fontSize:14}}>{selectedStudent.fullName}</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:10}}>
                <div style={{border:'1.5px solid #0F172A', borderRadius:10, padding:10, textAlign:'center'}}><div style={{fontSize:10, color:'#64748B'}}>TOTAL LEVY</div><div style={{fontWeight:900, fontSize:18}}>GHS {totalLevy}</div></div>
                <div style={{border:'1.5px solid #16A34A', borderRadius:10, padding:10, textAlign:'center'}}><div style={{fontSize:10, color:'#64748B'}}>PAID</div><div style={{fontWeight:900, fontSize:18, color:'#16A34A'}}>GHS {curPaid}</div></div>
                <div style={{border:'1.5px solid #DC2626', borderRadius:10, padding:10, textAlign:'center'}}><div style={{fontSize:10, color:'#64748B'}}>BALANCE</div><div style={{fontWeight:900, fontSize:18, color:balance>0?'#DC2626':'#16A34A'}}>GHS {balance}</div></div>
              </div>

              <div style={{marginTop:14, border:'1px solid #E2E8F0', borderRadius:10, padding:10, display:'flex', gap:6, alignItems:'end', flexWrap:'wrap'}}>
                <div><div style={{fontSize:10, fontWeight:800}}>Amount Paid Now</div><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 20" style={{padding:8, borderRadius:8, border:'1.5px solid #0F172A', fontWeight:800, width:120}}/></div>
                <div><div style={{fontSize:10, fontWeight:800}}>Method</div><select value={method} onChange={e=>setMethod(e.target.value)} style={{padding:8, borderRadius:8, border:'1.5px solid #CBD5E1'}}><option>Cash</option><option>MoMo</option><option>Bank</option></select></div>
                <button onClick={addPayment} style={{background:'#0F172A', color:'white', padding:'10px 16px', borderRadius:10, border:'none', fontWeight:900}}> + Add Payment</button>
                <button onClick={()=>{ if(confirm('Clear all payments for this student?')){ const n={...payments}; delete n[selectedId]; setPayments(n)}} } style={{marginLeft:'auto', background:'#FEE2E2', padding:'8px 12px', borderRadius:10, border:'none', fontWeight:800, fontSize:11}}>Clear</button>
              </div>

              <div style={{marginTop:14}}>
                <div style={{fontWeight:900, fontSize:12, marginBottom:6}}>Payment History</div>
                {(payments[selectedId]?.history||[]).length===0? <div style={{fontSize:11, color:'#94A3B8'}}>No payments yet</div> :
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:12}}>
                  <thead><tr style={{background:'#0F172A', color:'white'}}><th style={{padding:6, textAlign:'left'}}>Date</th><th>Amount</th><th>Method</th></tr></thead>
                  <tbody>{payments[selectedId].history.map((h,i)=><tr key={i} style={{borderBottom:'1px solid #E2E8F0'}}><td style={{padding:6}}>{h.date}</td><td style={{textAlign:'center', fontWeight:800}}>{h.amount}</td><td style={{textAlign:'center'}}>{h.method}</td></tr>)}</tbody>
                </table>}
              </div>

              <div style={{marginTop:16, border:'2px dashed #0F172A', borderRadius:12, padding:12}}>
                <div style={{fontWeight:900, textAlign:'center', marginBottom:8}}>RECEIPT PREVIEW - {className}</div>
                <div style={{fontSize:11, lineHeight:1.5}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span>Student:</span><b>{selectedStudent.fullName}</b></div>
                  {items.map(it=> <div key={it.name} style={{display:'flex', justifyContent:'space-between'}}><span>{it.name}</span><span>GHS {it.amount}</span></div>)}
                  <div style={{borderTop:'1.5px solid black', marginTop:6, paddingTop:6, display:'flex', justifyContent:'space-between', fontWeight:900}}><span>Total Levy</span><span>GHS {totalLevy}</span></div>
                  <div style={{display:'flex', justifyContent:'space-between', color:'#16A34A', fontWeight:800}}><span>Paid</span><span>GHS {curPaid}</span></div>
                  <div style={{display:'flex', justifyContent:'space-between', color:balance>0?'#DC2626':'#16A34A', fontWeight:900}}><span>Balance</span><span>GHS {balance}</span></div>
                  <div style={{textAlign:'center', marginTop:10, fontSize:10}}>{term} {year} • Thank You!</div>
                </div>
                <button onClick={()=>window.print()} style={{width:'100%', marginTop:10, background:'black', color:'white', padding:10, borderRadius:10, border:'none', fontWeight:900}}>🖨️ Print Receipt</button>
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  )
}