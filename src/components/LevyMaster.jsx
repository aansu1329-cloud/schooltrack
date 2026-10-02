import { useState, useEffect } from 'react'

const GROUPS = {
  A: { label:'GROUP A - KG (KG1, KG2, Nursery)', keys:['KG','NURSERY','CRECHE'] },
  B: { label:'GROUP B - Lower Primary (Class 1-3)', keys:['1','2','3'] },
  C: { label:'GROUP C - Upper Primary (Class 4-6)', keys:['4','5','6'] },
}

export default function LevyMaster({ onBack }){
  const [config, setConfig] = useState(()=> {
    try { return JSON.parse(localStorage.getItem('levy_config_v1')||'null') || {
      term:'Term 1', year:'2025/2026',
      A:{ items:[{name:'School Fees', amount:40},{name:'PTA', amount:20}] },
      B:{ items:[{name:'School Fees', amount:60},{name:'Exam Printing', amount:20},{name:'PTA', amount:30}] },
      C:{ items:[{name:'School Fees', amount:80},{name:'Exam Printing', amount:30},{name:'PTA', amount:40}] }
    }} catch { return {} }
  })

  useEffect(()=> localStorage.setItem('levy_config_v1', JSON.stringify(config)), [config])

  const total = (g) => config[g]?.items?.reduce((s,i)=> s + Number(i.amount||0),0) || 0

  const updateItem = (g, idx, field, val) => {
    const newItems = [...config[g].items]
    newItems[idx] = {...newItems[idx], [field]: field==='amount'? Number(val)||0 : val}
    setConfig({...config, [g]:{items:newItems}})
  }
  const addItem = (g) => setConfig({...config, [g]:{items:[...config[g].items, {name:'', amount:0}]}})
  const delItem = (g, idx) => setConfig({...config, [g]:{items: config[g].items.filter((_,i)=>i!==idx)}})

  return(
    <div style={{minHeight:'100vh', background:'#F8FAFC', padding:12, fontFamily:'Inter, sans-serif'}}>
      <div style={{maxWidth:1000, margin:'0 auto', background:'white', borderRadius:16, padding:16, boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        {onBack && (
          <button onClick={onBack} style={{background:'#0F172A', color:'white', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:800, fontSize:12, marginBottom:12, cursor:'pointer'}}>
            ‹ Back to Dashboard
          </button>
        )}
        <h2 style={{fontWeight:900, fontSize:18, marginBottom:4}}>👑 Headteacher - Levy Master Control</h2>
        <p style={{fontSize:12, color:'#64748B', marginBottom:12}}>Set once, appears on all classes automatically. Teachers cannot edit amount.</p>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14}}>
          <input value={config.term} onChange={e=>setConfig({...config, term:e.target.value})} style={{padding:8, borderRadius:8, border:'1.5px solid #E2E8F0', fontWeight:700}} placeholder="Term"/>
          <input value={config.year} onChange={e=>setConfig({...config, year:e.target.value})} style={{padding:8, borderRadius:8, border:'1.5px solid #E2E8F0', fontWeight:700}} placeholder="Academic Year"/>
        </div>

        {Object.keys(GROUPS).map(g=>(
          <div key={g} style={{border:'2px solid #0F172A', borderRadius:12, padding:12, marginBottom:14}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <div><div style={{fontWeight:900, fontSize:13}}>{GROUPS[g].label}</div><div style={{fontSize:11, color:'#065F46', fontWeight:800}}>TOTAL: GHS {total(g).toFixed(2)}</div></div>
              <button onClick={()=>addItem(g)} style={{background:'#0F172A', color:'white', padding:'6px 12px', borderRadius:100, border:'none', fontWeight:800, fontSize:11}}>+ Add Item</button>
            </div>
            {config[g]?.items?.map((it, idx)=>(
              <div key={idx} style={{display:'grid', gridTemplateColumns:'1fr 120px 40px', gap:6, marginBottom:6}}>
                <input value={it.name} onChange={e=>updateItem(g,idx,'name',e.target.value)} placeholder="e.g. School Fees, PTA, Exam" style={{padding:7, borderRadius:8, border:'1px solid #CBD5E1', fontSize:12}}/>
                <input type="number" value={it.amount} onChange={e=>updateItem(g,idx,'amount',e.target.value)} placeholder="Amount" style={{padding:7, borderRadius:8, border:'1px solid #CBD5E1', fontWeight:800}}/>
                <button onClick={()=>delItem(g,idx)} style={{background:'#FEE2E2', border:'none', borderRadius:8, fontWeight:900}}>✕</button>
              </div>
            ))}
          </div>
        ))}

        <div style={{background:'#DCFCE7', padding:10, borderRadius:10, fontSize:12, fontWeight:700}}>
          ✅ Published to all classes. Teachers will see: Group A = GHS {total('A')}, Group B = GHS {total('B')}, Group C = GHS {total('C')} for {config.term} {config.year}
        </div>

        <div style={{marginTop:16, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:8}}>
          {['5A','6A','3A','KG2'].map(cls=> {
            const allPayments = JSON.parse(localStorage.getItem(`levy_payments_${cls}_${config.term}_${config.year}`)||'{}')
            const collected = Object.values(allPayments).reduce((s,p)=> s + (p.paid||0),0)
            return <div key={cls} style={{border:'1px solid #E2E8F0', borderRadius:8, padding:8, fontSize:11}}><b>{cls}</b> — Collected: GHS {collected}</div>
          })}
        </div>
      </div>
    </div>
  )
}