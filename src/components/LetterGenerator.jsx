import { useState } from 'react'

const TO_HEAD_REASONS = ['Permission to be absent (traveling)','Sick Leave','Permission to leave early','Request for Permission','Explanation Letter','Other (Custom)']
const TO_DISTRICT_REASONS = ['Permission for Excursion','Request for Transfer / Posting','Enrollment Report','Study Leave','Maternity Leave','Collection of Items / Materials','BECE Registration / Introduction','Permission to organize program','Other (Custom)']

export default function LetterGenerator({ activeClass, students=[], onBack }){
  const [route, setRoute] = useState('To Headteacher') // To Headteacher / To District Through Head
  const [toHeadReason, setToHeadReason] = useState(TO_HEAD_REASONS[0])
  const [toDistReason, setToDistReason] = useState(TO_DISTRICT_REASONS[0])
  const [customTitle, setCustomTitle] = useState('')
  const [concernType, setConcernType] = useState('Student') // Student / Teacher / General
  const [selectedId, setSelectedId] = useState(students?.[0]?.id||'')
  const [schoolName, setSchoolName] = useState('ANAJI M/A JHS')
  const [headName, setHeadName] = useState('Mr. Augustine Ansu')
  const [extra, setExtra] = useState('')
  const [date] = useState(new Date().toLocaleDateString())

  const student = students.find(s=> String(s.id)===String(selectedId))
  const finalTitle = customTitle || (route==='To Headteacher'? toHeadReason : toDistReason)

  const getContent = ()=>{
    const who = concernType==='Student' && student? `${student.firstName} ${student.otherNames}` : concernType==='General'? 'our school' : 'the teacher'
    if(route==='To Headteacher'){
      return `Dear Sir,\n\nI write to seek your permission for ${finalTitle.toLowerCase()}. ${extra||''}\n\nConcerning: ${who} of ${activeClass?.name}.\n\nI shall be grateful if my request is granted.\n\nThank you.`
    } else {
      return `${finalTitle.toUpperCase()}\n\nI wish to apply / inform you about ${finalTitle.toLowerCase()} concerning ${who}. ${extra||''}\n\nWe hope for your favorable consideration.\n\nThank you.`
    }
  }

  const download = ()=>{
    let arch=JSON.parse(localStorage.getItem('anaji_archive')||'[]')
    arch.unshift({id:Date.now(), type:'letter', title:finalTitle+' - '+route, content:fullText(), date:new Date().toISOString()})
    localStorage.setItem('anaji_archive', JSON.stringify(arch))
    const html=`<html><body>${letterHTML()}</body></html>`
    const blob=new Blob([html],{type:'application/msword'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${finalTitle}.doc`; a.click()
  }
  const fullText = ()=> letterHTML().replace(/<[^>]*>/g,'\n')

  const letterHTML = ()=>{
    if(route==='To Headteacher'){
      return `<center><h2>${schoolName}</h2><p>${finalTitle}</p></center><p>Date: ${date}</p><p>From: Class Teacher, ${activeClass?.name}<br>To: The Headteacher, ${schoolName}</p><hr/><p style="white-space:pre-line">${getContent()}</p><br/><p>Yours faithfully,<br/>Class Teacher</p>`
    } else {
      return `<div style="text-align:right">${schoolName}<br/>P.O BOX AN, TAKORADI<br/>${date}</div><div>The District Director,<br/>Ghana Education Service,<br/>STMA - Takoradi</div><div style="text-align:center; margin:15px 0"><b>Through: The Headteacher, ${schoolName}</b></div><div>Dear Sir,</div><p style="text-align:center"><b><u>RE: ${finalTitle.toUpperCase()}</u></b></p><p style="white-space:pre-line">${getContent()}</p><br/><p>Yours faithfully,<br/><b>${headName}</b><br/>Headteacher, ${schoolName}</p>`
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:16}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:'800'}}>‹ Back</button>
        <h2 style={{fontWeight:'900', marginTop:12}}>✉️ Letters — {route}</h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:16, marginTop:12}}>
          <div style={{background:'#151E32', border:'1px solid #2A3552', borderRadius:16, padding:14}}>
            <div style={{fontSize:10, fontWeight:'800', color:'#4ADE80'}}>WHERE IS LETTER GOING? *</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:6}}>
              <button onClick={()=>setRoute('To Headteacher')} style={{padding:12, borderRadius:10, border:route==='To Headteacher'?'2px solid #4ADE80':'1px solid #2A3552', background:route==='To Headteacher'?'#14532D':'#0F172A', color:'white', fontWeight:'800', fontSize:11}}>To Headteacher (Direct)</button>
              <button onClick={()=>setRoute('To District Through Head')} style={{padding:12, borderRadius:10, border:route==='To District Through Head'?'2px solid #F59E0B':'1px solid #2A3552', background:route==='To District Through Head'?'#422006':'#0F172A', color:'white', fontWeight:'800', fontSize:11}}>To District Through Head (3-address)</button>
            </div>

            <div style={{marginTop:12}}>
              <div style={{fontSize:10, fontWeight:'800'}}>REASON / TYPE *</div>
              <select value={route==='To Headteacher'?toHeadReason:toDistReason} onChange={e=> route==='To Headteacher'?setToHeadReason(e.target.value):setToDistReason(e.target.value)} style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white', marginTop:4}}>
                {(route==='To Headteacher'?TO_HEAD_REASONS:TO_DISTRICT_REASONS).map(r=><option key={r}>{r}</option>)}
              </select>
              <input value={customTitle} onChange={e=>setCustomTitle(e.target.value)} placeholder="If Other/Custom, type title here..." style={{width:'100%', marginTop:6, background:'#0F172A', border:'1px dashed #4ADE80', borderRadius:10, padding:10, color:'white', fontSize:11}}/>
            </div>

            <div style={{marginTop:12}}>
              <div style={{fontSize:10, fontWeight:'800'}}>WHO IS CONCERNED?</div>
              <div style={{display:'flex', gap:6, marginTop:4}}>{['Student','Teacher','General'].map(t=><button key={t} onClick={()=>setConcernType(t)} style={{flex:1, padding:8, borderRadius:100, border:concernType===t?'2px solid #60A5FA':'1px solid #2A3552', background:concernType===t?'#1E3A8A':'#0F172A', color:'white', fontWeight:'800', fontSize:11}}>{t}</button>)}</div>
              {concernType==='Student'&&<select value={selectedId} onChange={e=>setSelectedId(e.target.value)} style={{width:'100%', marginTop:8, background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:9, color:'white', fontSize:12}}>{students.map(s=><option key={s.id} value={s.id}>{s.firstName} {s.otherNames}</option>)}</select>}
            </div>

            <input value={extra} onChange={e=>setExtra(e.target.value)} placeholder="Extra details / dates / reason..." style={{width:'100%', marginTop:12, background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white'}}/>
          </div>

          <div style={{background:'white', color:'black', borderRadius:16, padding:20}}>
            <div dangerouslySetInnerHTML={{__html: letterHTML()}} style={{fontSize:12, lineHeight:1.6}}/>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:16}}>
              <button onClick={download} style={{padding:12, background:'black', color:'white', borderRadius:10, border:'none', fontWeight:'900'}}>📥 Download Word</button>
              <button onClick={()=>window.print()} style={{padding:12, background:'#1E293B', color:'white', borderRadius:10, border:'none', fontWeight:'900'}}>📥 PDF</button>
              <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(fullText())}`,'_blank')} style={{padding:12, background:'#25D366', color:'white', borderRadius:10, border:'none', fontWeight:'900'}}>💚 WhatsApp</button>
              <button onClick={()=>window.open(`mailto:?subject=${finalTitle}&body=${encodeURIComponent(fullText())}`,'_blank')} style={{padding:12, background:'#EA4335', color:'white', borderRadius:10, border:'none', fontWeight:'900'}}>📧 Email</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}