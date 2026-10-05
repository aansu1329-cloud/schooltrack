import { useState, useEffect } from 'react'

export default function ClassAnnouncementView(){
  const [ann, setAnn] = useState(null)

  useEffect(()=>{
    const load = ()=>{
      try{
        const local = JSON.parse(localStorage.getItem('school_announcements')||'[]')
        const now = new Date()
        const valid = local.filter(a=>{
          if(!a.expiry) return true
          return new Date(a.expiry) >= now
        })
        if(valid.length>0) setAnn(valid[0])
        else setAnn(null)
      }catch(e){
        setAnn(null)
      }
    }
    load()
    const t=setInterval(load, 60000)
    return ()=>clearInterval(t)
  },[])

  if(!ann){
    return (
      <div style={{background:'#151A2E', border:'1px dashed #2A3552', borderRadius:16, padding:14, marginBottom:16, textAlign:'center'}}>
        <div style={{fontSize:11, color:'#64748B'}}>No announcement from Head Teacher</div>
      </div>
    )
  }

  const daysLeft = ann.expiry? Math.ceil((new Date(ann.expiry)-new Date())/(1000*60*60*24)) : 0

  return (
    <div style={{background:'#0F172A', border:'1px solid #F59E0B', borderRadius:16, padding:14, marginBottom:16}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:10, fontWeight:'900', color:'#F59E0B'}}>SCHOOL ANNOUNCEMENT - From Head Teacher</div>
        {ann.expiry && <div style={{fontSize:9, background:'#422006', color:'#FDE68A', padding:'2px 8px', borderRadius:100}}>Expires {ann.expiry} ({daysLeft}d left)</div>}
      </div>
      <div style={{fontWeight:'800', fontSize:16, marginTop:6}}>{ann.title}</div>
      <div style={{fontSize:13, color:'#CBD5E1', marginTop:6, whiteSpace:'pre-line', lineHeight:1.6}}>{ann.body}</div>
      <div style={{fontSize:10, color:'#64748B', marginTop:8}}>Read only - Cannot edit - Posted by Head Teacher</div>
    </div>
  )
}