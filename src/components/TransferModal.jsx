import { useState, useEffect } from 'react'
import { mockUsers } from '../data/mockData.js'

export default function TransferModal({open, onClose, onTransfer}){
  const [username, setUsername] = useState('')
  const [found, setFound] = useState(null)

  useEffect(()=>{
    const f=mockUsers.find(u=>u.username.toLowerCase().includes(username.toLowerCase()));
    setFound(username.trim()?f||null:null)
  }, [username])

  if(!open) return null

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(2,6,23,0.92)', display:'flex', justifyContent:'center', paddingTop:60, zIndex:90, paddingLeft:16, paddingRight:16}}>
      <div style={{background:'#111B30', border:'1px solid #1E293B', borderRadius:16, width:'100%', maxWidth:560, height:'fit-content'}}>
        <div style={{display:'flex', justifyContent:'space-between', padding:'18px 20px', borderBottom:'1px solid #1E293B'}}>
          <b>⇄ Transfer Class Ownership</b>
          <button onClick={onClose} style={{background:'none', border:'none', color:'#94A3B8', fontSize:18, cursor:'pointer'}}>✕</button>
        </div>
        <div style={{padding:20}}>
          <div style={{background:'rgba(120,53,15,0.3)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:12, padding:'14px 16px', display:'flex', gap:10}}>
            <div>🛡️</div>
            <div>
              <div style={{color:'#FBBF24', fontWeight:'800', fontSize:12}}>WARNING: IRREVERSIBLE ACTION</div>
              <div style={{color:'#D9B27A', fontSize:11, marginTop:4, lineHeight:'16px'}}>Transferring ownership will change primary teacher. New teacher will have full control including ability to delete class and manage teachers.</div>
            </div>
          </div>
          <div style={{marginTop:20}}>
            <label style={{fontSize:10, color:'#94A3B8', fontWeight:'700'}}>NEW TEACHER USERNAME</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username... kwame123" style={{width:'100%', marginTop:8, background:'#0F1A2E', border:'1px solid #23304D', borderRadius:12, padding:'12px 14px', color:'white'}}/>
          </div>
          <div style={{marginTop:14, background:'#0F172A', border:'1px dashed #1E293B', borderRadius:12, padding:20, textAlign:'center'}}>
            {!found? <span style={{color:'#475569', fontSize:11}}>Enter username... Try kwame123</span> : <span><b>{found.name}</b> <span style={{background:'#22C55E', color:'black', padding:'2px 8px', borderRadius:100, fontSize:10, marginLeft:8}}>✓ Ready to transfer</span></span>}
          </div>
          <div style={{display:'flex', gap:12, marginTop:22}}>
            <button onClick={onClose} style={{flex:1, background:'transparent', color:'white', padding:14, border:'none', cursor:'pointer'}}>Cancel</button>
            <button onClick={()=>{ if(!found) return; if(confirm(`Transfer class to ${found.name}?`)){ onTransfer(found); setUsername(''); setFound(null) }}} disabled={!found} style={{flex:1, background: found?'#CBD5E1':'#334155', color: found?'black':'#94A3B8', padding:14, borderRadius:12, border:'none', fontWeight:'700', cursor: found?'pointer':'not-allowed'}}>Transfer Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}
