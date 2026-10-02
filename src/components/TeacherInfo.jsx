import { useState, useEffect } from 'react'
import { getActiveSchoolId, getClassKeyVersioned } from '../utils/storage.js'

export default function TeacherInfo({ activeClass, onBack }){
  const sid = getActiveSchoolId() || 'SCHOOL'
  const key = getClassKeyVersioned(activeClass?.name || 'CLASS', 'teacher_info', 'v1')

  const [info, setInfo] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem(key)||'{}') }catch{ return {} }
  })

  useEffect(()=>{ localStorage.setItem(key, JSON.stringify(info)) }, [info, key])

  const handleSig = (e)=>{
    const f=e.target.files[0]; if(!f) return
    if(f.size>1024*1024){ alert('Signature too big - <1MB'); return }
    const r=new FileReader(); r.onload=(ev)=> setInfo({...info, signature: ev.target.result}); r.readAsDataURL(f)
  }

  return (
    <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:16}}>
      <div style={{maxWidth:600, margin:'0 auto'}}>
        <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:'700'}}>‹ {activeClass?.name}</button>
        <h2 style={{marginTop:16, fontWeight:'900'}}>👨‍🏫 Class Teacher Info - {activeClass?.name}</h2>
        <p style={{fontSize:11, color:'#94A3B8'}}>This info will show on Report Card • Signature + Name + Phone in brackets</p>

        <div style={{marginTop:16, background:'#151E32', border:'1px solid #23304D', borderRadius:16, padding:16}}>

          <div style={{fontSize:12, fontWeight:'700', marginBottom:6}}>Full Name *</div>
          <input value={info.name||''} onChange={e=>setInfo({...info, name:e.target.value})} placeholder="e.g. OTENG DUKU EUODIA" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white'}}/>

          <div style={{marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div>
              <div style={{fontSize:12, fontWeight:'700', marginBottom:6}}>Phone Number *</div>
              <input value={info.phone||''} onChange={e=>setInfo({...info, phone:e.target.value})} placeholder="0244..." style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white'}}/>
            </div>
            <div>
              <div style={{fontSize:12, fontWeight:'700', marginBottom:6}}>Staff ID / GES No.</div>
              <input value={info.staffId||''} onChange={e=>setInfo({...info, staffId:e.target.value})} placeholder="GES123" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white'}}/>
            </div>
          </div>

          <div style={{marginTop:12}}>
            <div style={{fontSize:12, fontWeight:'700', marginBottom:6}}>Qualification</div>
            <input value={info.qualification||''} onChange={e=>setInfo({...info, qualification:e.target.value})} placeholder="e.g. B.Ed, Diploma" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white'}}/>
          </div>

          <div style={{marginTop:12}}>
            <div style={{fontSize:12, fontWeight:'700', marginBottom:6}}>Subject Specialization</div>
            <input value={info.subject||''} onChange={e=>setInfo({...info, subject:e.target.value})} placeholder="e.g. Maths & Science" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white'}}/>
          </div>

          <div style={{marginTop:16, background:'#0F172A', border:'1px dashed #2A3552', borderRadius:12, padding:14}}>
            <div style={{fontSize:12, fontWeight:'800'}}>✍️ Signature Upload (for Report Card)</div>
            <div style={{fontSize:10, color:'#94A3B8', marginTop:4}}>Sign on white paper, take photo, upload — will show on report card</div>
            <div style={{marginTop:10, display:'flex', gap:10, alignItems:'center'}}>
              {info.signature? <img src={info.signature} style={{width:120, height:60, background:'white', borderRadius:8, objectFit:'contain', padding:4}}/> : <div style={{width:120, height:60, background:'white', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#94A3B8', fontSize:10}}>No Signature</div>}
              <label style={{background:'white', color:'black', padding:'8px 14px', borderRadius:100, fontWeight:'800', fontSize:11, cursor:'pointer'}}>
                Upload Signature
                <input type="file" accept="image/*" hidden onChange={handleSig}/>
              </label>
              {info.signature && <button onClick={()=>setInfo({...info, signature:''})} style={{background:'#1E293B', border:'1px solid #7F1D1D', color:'#F87171', padding:'8px 14px', borderRadius:100, fontSize:11}}>Remove</button>}
            </div>
            {info.signature && (
              <div style={{marginTop:10, background:'white', color:'black', borderRadius:8, padding:10, textAlign:'center'}}>
                <img src={info.signature} style={{width:100, height:40, objectFit:'contain'}}/>
                <div style={{fontSize:12, fontWeight:'800', marginTop:4, borderTop:'1px solid black', paddingTop:4}}>{info.name||'Class Teacher'} <span style={{fontWeight:'600'}}>({info.phone||'phone'})</span></div>
                <div style={{fontSize:9, color:'#64748B'}}>Preview as it will show on Report Card</div>
              </div>
            )}
          </div>

          <div style={{marginTop:16, background:'#052E16', border:'1px solid #16A34A', borderRadius:10, padding:10, fontSize:11, color:'#86EFAC', textAlign:'center'}}>
            ✅ Saved automatically • Will show on Report Card as:<br/>
            <b style={{color:'white'}}>Signature Image + Name (Phone)</b><br/>
            Top of report keeps Student Picture + School Logo (already done)
          </div>

        </div>
      </div>
    </div>
  )
}