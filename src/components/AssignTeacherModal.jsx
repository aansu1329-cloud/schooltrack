import { useState, useEffect } from 'react'
import { mockUsers } from '../data/mockData.js'

export default function AssignTeacherModal({open, onClose, classSubjects, onAssign, existingTeachers}){
  const [username, setUsername] = useState('')
  const [foundUser, setFoundUser] = useState(null)
  const [selected, setSelected] = useState([])

  useEffect(()=>{
    const f = mockUsers.find(u=> u.username.toLowerCase().includes(username.toLowerCase()))
    setFoundUser(username.trim()? f||null : null)
  }, [username])

  if(!open) return null

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, zIndex:80}}>
      <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:20, width:'100%', maxWidth:620, maxHeight:'90vh', overflowY:'auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #1E293B'}}><h3 style={{fontWeight:'800', margin:0}}>Assign Teacher</h3><button onClick={onClose} style={{background:'#1E293B', border:'none', color:'#94A3B8', width:32, height:32, borderRadius:8, cursor:'pointer'}}>×</button></div>
        <div style={{padding:'24px'}}>
          <div style={{position:'relative'}}><span style={{position:'absolute', left:14, top:13, opacity:0.5}}>🔍</span><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username... kwame123" style={{width:'100%', background:'#1A2236', border:'1px solid #2A3552', borderRadius:12, padding:'12px 12px 12px 40px', color:'white'}} /></div>
          <div style={{marginTop:10, background:'#111A2E', borderRadius:12, padding:16, minHeight:60, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #1E293B'}}>
            {!foundUser? <div style={{color:'#475569', fontSize:12}}>Search username... Try: kwame123 or ama_teacher</div> : <div style={{display:'flex', gap:12, width:'100%', alignItems:'center'}}><img src={`https://i.pravatar.cc/100?u=${foundUser.username}`} style={{width:40, height:40, borderRadius:100}}/><div><b>{foundUser.name}</b><div style={{fontSize:11, color:'#94A3B8'}}>@{foundUser.username}</div></div><div style={{marginLeft:'auto', background:'#22C55E', padding:'4px 10px', borderRadius:100, fontSize:10, color:'black', fontWeight:'bold'}}>✓ Found</div></div>}
          </div>
          <div style={{marginTop:8, fontSize:10, color:'#64748B'}}>SELECT SUBJECTS TO ASSIGN</div>
          <div style={{marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            {classSubjects.map(s=>{ const c=selected.includes(s); return <button key={s} onClick={()=>setSelected(c? selected.filter(x=>x!==s): [...selected,s])} style={{background:'#151E32', border: c?'1px solid white':'1px solid #23304D', padding:12, borderRadius:12, display:'flex', gap:10, color:'white', textAlign:'left', cursor:'pointer'}}><div style={{width:18, height:18, background:c?'white':'transparent', borderRadius:4, border:c?'none':'1px solid #475569', color:'black', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10}}>{c?'✓':''}</div><span style={{fontSize:10, fontWeight:'700'}}>{s}</span></button>})}
          </div>
          <div style={{display:'flex', gap:12, marginTop:20}}><button onClick={onClose} style={{flex:1, background:'transparent', color:'white', padding:14, border:'none', cursor:'pointer'}}>Cancel</button><button onClick={()=>{ if(!foundUser||selected.length===0) return alert('Select user + subject'); if(existingTeachers.find(t=>t.username===foundUser.username)) return alert('Already assigned'); onAssign({...foundUser, subjects:selected}); setUsername(''); setFoundUser(null); setSelected([])}} style={{flex:1, background:'#E2E8F0', color:'black', padding:14, borderRadius:12, fontWeight:'bold', border:'none', cursor:'pointer'}}>+ Assign ({selected.length})</button></div>
        </div>
      </div>
    </div>
  )
}