import { useState, useEffect } from 'react'

export default function HeadTeacherAnnouncement(){
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [expiry, setExpiry] = useState('') // NEW
  const [loading, setLoading] = useState(false)

  const load = async ()=>{
    try{
      const local = JSON.parse(localStorage.getItem('school_announcements')||'[]')
      // auto-filter expired
      const now = new Date()
      const valid = local.filter(a=>{
        if(!a.expiry) return true
        return new Date(a.expiry) >= now
      })
      if(valid.length!== local.length){
        localStorage.setItem('school_announcements', JSON.stringify(valid))
      }
      setAnnouncements(valid)
    }catch{}
  }
  useEffect(()=>{ load(); const t=setInterval(load, 60000); return ()=>clearInterval(t) },[])

  const postAnnouncement = async ()=>{
    if(!title.trim() ||!body.trim()) return alert('Enter title and message')
    if(!expiry) return alert('Select expiry date - when should it disappear?')
    setLoading(true)
    const newAnn = {
      id:Date.now(),
      title, body, expiry,
      scope:'school',
      createdAt:new Date().toISOString()
    }
    const updated = [newAnn,...announcements]
    localStorage.setItem('school_announcements', JSON.stringify(updated))
    try{
      await fetch('/api/announcements', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newAnn) })
    }catch{}
    setAnnouncements(updated)
    setTitle(''); setBody(''); setExpiry(''); setLoading(false)
    alert(`✅ Posted! Will auto-disappear on ${expiry}. All classes see it.`)
  }

  const deleteAnn = (id)=>{
    if(!confirm('Delete for all classes?')) return
    const filtered = announcements.filter(a=>a.id!==id)
    localStorage.setItem('school_announcements', JSON.stringify(filtered))
    setAnnouncements(filtered)
  }

  return (
    <div style={{background:'#151E32', border:'1px solid #2A3552', borderRadius:16, padding:14}}>
      <h3 style={{fontWeight:'900', color:'#F59E0B', margin:0}}>📢 SCHOOL ANNOUNCEMENT - Head Teacher Only</h3>
      <p style={{fontSize:11, color:'#94A3B8', marginTop:4}}>Post here → ALL classes see read-only. Auto disappears after expiry.</p>

      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title e.g. Mid-Term Break" style={{width:'100%', marginTop:12, background:'#0F172A', border:'1px solid #334155', borderRadius:8, padding:12, color:'white'}}/>
      <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Message for all classes..." style={{width:'100%', marginTop:8, background:'#0F172A', border:'1px solid #334155', borderRadius:8, padding:12, color:'white'}}/>

      <div style={{marginTop:8}}>
        <div style={{fontSize:10, fontWeight:'800', color:'#F59E0B'}}>⏰ EXPIRY DATE (auto disappears)</div>
        <input type="date" value={expiry} onChange={e=>setExpiry(e.target.value)} style={{width:'100%', marginTop:4, background:'#0F172A', border:'1px solid #F59E0B', borderRadius:8, padding:12, color:'white'}}/>
        <div style={{fontSize:10, color:'#64748B', marginTop:4}}>After this date, announcement will not show to class teachers again.</div>
      </div>

      <button onClick={postAnnouncement} disabled={loading} style={{marginTop:10, width:'100%', background:'#F59E0B', color:'black', padding:14, borderRadius:10, border:'none', fontWeight:'900'}}>{loading?'Posting...':'🚀 POST TO ALL CLASSES'}</button>

      <div style={{marginTop:16}}>
        <div style={{fontSize:10, fontWeight:'800'}}>ACTIVE ANNOUNCEMENTS ({announcements.length})</div>
        {announcements.map(a=>{
          const isExpired = a.expiry && new Date(a.expiry) < new Date()
          const daysLeft = a.expiry? Math.ceil((new Date(a.expiry)-new Date())/(1000*60*60*24)) : 0
          return (
            <div key={a.id} style={{background:isExpired?'#1a0000':'#0F172A', borderRadius:10, padding:10, marginTop:8, border:isExpired?'1px solid red':'1px solid #1E293B', opacity:isExpired?0.5:1}}>
              <b style={{fontSize:14}}>{a.title}</b>
              <div style={{fontSize:12, marginTop:4, whiteSpace:'pre-line'}}>{a.body}</div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:8, alignItems:'center'}}>
                <div>
                  <div style={{fontSize:10, color:'#F59E0B'}}>⏰ Expires: {a.expiry} {daysLeft>0? `(${daysLeft} days left)` : '(Expired)'}</div>
                  <div style={{fontSize:9, color:'#64748B'}}>{new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={()=>deleteAnn(a.id)} style={{background:'#7F1D1D', color:'white', border:'none', borderRadius:6, padding:'6px 14px', fontSize:11, fontWeight:'800'}}>🗑️ Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}