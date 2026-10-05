import { useState, useEffect } from 'react'

export default function Archive({ onBack }){
  const [archive, setArchive] = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(()=>{
    load()
  }, [])

  const load = ()=>{
    try{
      const data = JSON.parse(localStorage.getItem('anaji_archive')||'[]')
      setArchive(data)
    }catch{ setArchive([]) }
  }

  const deleteItem = (id)=>{
    if(!confirm('Delete this from archive?')) return
    const newArch = archive.filter(a=>a.id!==id)
    localStorage.setItem('anaji_archive', JSON.stringify(newArch))
    setArchive(newArch)
    setPreview(null)
  }

  const clearAll = ()=>{
    if(!confirm('Clear ALL archive? This cannot be undone!')) return
    localStorage.removeItem('anaji_archive')
    setArchive([])
  }

  const filtered = archive.filter(a=>{
    if(filter!=='All' && a.type!==filter.toLowerCase()) return false
    if(search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const downloadWord = (item)=>{
    const content = item.type==='letter' ? item.content : `${item.title}\n\n${item.questions?.join('\n')}`
    const html = `<html><body><h2>${item.title}</h2><p>Date: ${new Date(item.date).toLocaleString()}</p><p style="white-space:pre-line">${content.replace(/\n/g,'<br/>')}</p></body></html>`
    const blob = new Blob([html], {type:'application/msword'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`${item.title}.doc`; a.click()
  }

  const shareWhatsApp = (item)=>{
    const text = item.type==='letter' ? item.content.slice(0,900) : `${item.title}\n\n${item.questions?.slice(0,6).join('\n')}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareEmail = (item)=>{
    const body = item.type==='letter' ? item.content : `${item.title}\n\n${item.questions?.join('\n')}`
    window.open(`mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(body)}`, '_blank')
  }

  const shareAnywhere = async (item)=>{
    const body = item.type==='letter' ? item.content : `${item.title}\n\n${item.questions?.join('\n')}`
    if(navigator.share){
      try{ await navigator.share({title: item.title, text: body}) }catch{}
    } else {
      navigator.clipboard.writeText(body)
      alert('Copied! Paste anywhere - WhatsApp, Telegram, Drive')
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:16}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:'800', cursor:'pointer'}}>‹ Back</button>
        
        <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginTop:16}}>
          <div>
            <h1 style={{margin:0, fontWeight:'900', fontSize:22}}>🗂️ CARD 3: Archive - Old Exams & Letters</h1>
            <div style={{fontSize:11, color:'#94A3B8', marginTop:4}}>{archive.length} files saved • Tap any to Download + Share again</div>
          </div>
          <button onClick={clearAll} style={{background:'#7F1D1D', color:'white', padding:'10px 16px', borderRadius:100, border:'none', fontWeight:'800', cursor:'pointer'}}>🗑️ Clear All</button>
        </div>

        <div style={{display:'flex', gap:8, marginTop:14, flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search archive..." style={{flex:1, minWidth:180, background:'#151E32', border:'1px solid #2A3552', borderRadius:100, padding:'10px 16px', color:'white'}}/>
          {['All','Exam','Letter'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'10px 18px', borderRadius:100, border:'none', fontWeight:'900', fontSize:12, background:filter===f?'white':'#1E293B', color:filter===f?'black':'white', cursor:'pointer'}}>{f} {f==='All'?`(${archive.length})`: f==='Exam'?`(${archive.filter(a=>a.type==='exam').length})`:`(${archive.filter(a=>a.type==='letter').length})`}</button>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns: preview?'1fr 1.3fr':'1fr', gap:16, marginTop:16}}>
          <div style={{background:'#151E32', border:'1px solid #2A3552', borderRadius:16, padding:12, maxHeight:'75vh', overflowY:'auto'}}>
            {filtered.length===0 && <div style={{textAlign:'center', padding:40, color:'#64748B'}}><div style={{fontSize:30}}>📭</div><div style={{marginTop:8, fontWeight:'700'}}>No files yet</div><div style={{fontSize:11, marginTop:4}}>Generate Exams or Letters — they will auto-save here</div></div>}
            {filtered.map(item=>(
              <div key={item.id} onClick={()=>setPreview(item)} style={{background: preview?.id===item.id?'#1E3A8A':'#0F172A', border: preview?.id===item.id?'2px solid #60A5FA':'1px solid #2A3552', borderRadius:12, padding:12, marginBottom:10, cursor:'pointer'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span style={{fontSize:10, padding:'3px 8px', borderRadius:100, background: item.type==='exam'?'#F59E0B':'#4ADE80', color:'black', fontWeight:'900'}}>{item.type.toUpperCase()}</span>
                  <span style={{fontSize:10, color:'#94A3B8'}}>{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div style={{fontWeight:'800', fontSize:13, marginTop:6, lineHeight:1.3}}>{item.title}</div>
                <div style={{fontSize:11, color:'#94A3B8', marginTop:4}}>{item.classLevel} • {item.type==='exam'? `${item.questions?.length} questions` : 'Letter'}</div>
                <div style={{display:'flex', gap:4, marginTop:8}}>
                  <button onClick={(e)=>{e.stopPropagation(); downloadWord(item)}} style={{fontSize:9, padding:'5px 8px', borderRadius:100, border:'none', background:'white', color:'black', fontWeight:'800'}}>Word</button>
                  <button onClick={(e)=>{e.stopPropagation(); shareWhatsApp(item)}} style={{fontSize:9, padding:'5px 8px', borderRadius:100, border:'none', background:'#25D366', color:'white', fontWeight:'800'}}>WA</button>
                  <button onClick={(e)=>{e.stopPropagation(); shareEmail(item)}} style={{fontSize:9, padding:'5px 8px', borderRadius:100, border:'none', background:'#EA4335', color:'white', fontWeight:'800'}}>Email</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{background:'white', color:'black', borderRadius:16, padding:20, display: preview?'block':'none', maxHeight:'75vh', overflowY:'auto'}}>
            {!preview? null : (
              <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                  <div>
                    <div style={{fontSize:10, padding:'3px 8px', borderRadius:100, background:'black', color:'white', display:'inline-block', fontWeight:'900'}}>{preview.type.toUpperCase()}</div>
                    <h2 style={{margin:'8px 0 0', fontWeight:'900', fontSize:16, lineHeight:1.2}}>{preview.title}</h2>
                    <div style={{fontSize:11, color:'#64748B', marginTop:4}}>{new Date(preview.date).toLocaleString()} • {preview.classLevel}</div>
                  </div>
                  <button onClick={()=>deleteItem(preview.id)} style={{background:'#FEE2E2', color:'#DC2626', border:'none', padding:'8px 12px', borderRadius:100, fontWeight:'800', fontSize:11, cursor:'pointer'}}>🗑️ Delete</button>
                </div>

                <div style={{marginTop:16, borderTop:'2px solid black', paddingTop:12, fontSize:13, lineHeight:1.6, whiteSpace:'pre-line'}}>
                  {preview.type==='letter'? preview.content : preview.questions?.join('\n')}
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:20}}>
                  <button onClick={()=>downloadWord(preview)} style={{padding:12, background:'black', color:'white', borderRadius:10, border:'none', fontWeight:'900', cursor:'pointer'}}>📥 Download Word</button>
                  <button onClick={()=>window.print()} style={{padding:12, background:'#1E293B', color:'white', borderRadius:10, border:'none', fontWeight:'900', cursor:'pointer'}}>📥 Download PDF</button>
                  <button onClick={()=>shareWhatsApp(preview)} style={{padding:12, background:'#25D366', color:'white', borderRadius:10, border:'none', fontWeight:'900', cursor:'pointer'}}>💚 WhatsApp</button>
                  <button onClick={()=>shareEmail(preview)} style={{padding:12, background:'#EA4335', color:'white', borderRadius:10, border:'none', fontWeight:'900', cursor:'pointer'}}>📧 Email</button>
                  <button onClick={()=>shareAnywhere(preview)} style={{gridColumn:'span 2', padding:12, background:'#7C3AED', color:'white', borderRadius:10, border:'none', fontWeight:'900', cursor:'pointer'}}>📤 Share Anywhere / Copy</button>
                </div>

                <div style={{marginTop:12, background:'#F1F5F9', borderRadius:10, padding:10, fontSize:10, color:'#475569'}}>
                  💡 <b>How share works on phone:</b><br/>
                  • WhatsApp → Opens WhatsApp with file text<br/>
                  • Email → Opens Gmail ready to send<br/>
                  • Share Anywhere → Telegram, Drive, Bluetooth, etc.<br/>
                  • Word/PDF → Saves to your phone Downloads
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}