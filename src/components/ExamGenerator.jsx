import { useState, useEffect } from 'react'
import { generateExamWithGemini } from "../utils/api.js";

const EXAM_TYPES = ['Class Test','Midterm Exams','End of Term Exams']
const getAutoOptions = (className)=>{
  const c = (className||'').toUpperCase()
  if(c.includes('KG')) return {type:'A-B', opts:['A','B']}
  if(c.includes('BASIC 1')||c.includes('BASIC 2')||c.includes('BASIC 3')) return {type:'A-C', opts:['A','B','C']}
  return {type:'A-D', opts:['A','B','C','D']}
}

export default function ExamGenerator({ activeClass, selectedSubs=[], onBack }){
  const className = activeClass?.name || 'Basic 5A'
  const auto = getAutoOptions(className)

  // NEW: Get subjects from CLASS itself, not teacher
  const classSubjects = activeClass?.subjects
    || activeClass?.subjectList
    || activeClass?.curriculum
    || selectedSubs.length>0? selectedSubs
    : ['Mathematics','English Language','Integrated Science','Social Studies','RME','Creative Arts','Ghanaian Language','OWOP','Computing']

  const teacherSubs = classSubjects

  const [examType, setExamType] = useState('Midterm Exams')
  const [subject, setSubject] = useState(teacherSubs[0])
  const [topics, setTopics] = useState('')
  const [objCount, setObjCount] = useState(30)
  const [theoryCount, setTheoryCount] = useState(6)
  const [theoryToAnswer, setTheoryToAnswer] = useState(3)
  const [optType, setOptType] = useState(auto.type)
  const [structure, setStructure] = useState('Mix Objective + Theory')
  const [generated, setGenerated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('')
  const [bulkResults, setBulkResults] = useState([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedBulkSubs, setSelectedBulkSubs] = useState(teacherSubs)

  // When class changes, update bulk list
  useEffect(()=>{
    setSelectedBulkSubs(classSubjects)
    setSubject(classSubjects[0])
  }, [activeClass?.name])

  const finalOpts = optType==='A-B'? ['A','B'] : optType==='A-C'? ['A','B','C'] : ['A','B','C','D']
  const calculateMarks = ()=>{
    if(structure==='Objective Only') return { objPer:(100/objCount).toFixed(1), theoryPer:0, objTotal:100, theoryTotal:0 }
    if(structure==='Theory Only') return { objPer:0, theoryPer:(100/theoryToAnswer).toFixed(1), objTotal:0, theoryTotal:100 }
    return { objPer:(60/objCount).toFixed(1), theoryPer:(40/theoryToAnswer).toFixed(1), objTotal:60, theoryTotal:40 }
  }
  const marks = calculateMarks()
  const shuffle = (arr)=>{ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a }
  const getQuestionBank = (subj)=> Array.from({length:50},(_,k)=>({q:`${subj} Question ${k+1} on ${topics||subj}`, o:['Correct','Wrong A','Wrong B','Wrong C'], ans:'A'}))

  const genSingleForSubject = async (subj) =>{
    try{
      const g=await generateExamWithGemini({ subject:subj, classLevel:className, topics:topics||subj, numObjectives:objCount, numTheory:theoryCount, difficulty:'GES', randomized:true })
      if(g.source==='gemini' && g.objectives?.length>0){
        let objectives=g.objectives.map((it,i)=>{ let qt=`${i+1}. ${it.question} [${marks.objPer} marks]`; (it.options||[]).forEach((op,idx)=>{ if(finalOpts[idx]) qt+=`\n${finalOpts[idx]}. ${op}` }); return qt })
        let theories=g.theory.map((t,i)=> `${i+1}. ${t.question} [${marks.theoryPer} marks]`)
        let answers=g.answerKey.map(a=> `${a.id}. ${a.answer}`)
        return { subject:subj, title:`${examType} - ${subj} - ${className}`, objectives, theories, answers, source:'⚡ Gemini' }
      }
    }catch(e){}
    const bank=shuffle(getQuestionBank(subj))
    let objectives=[], answers=[]
    for(let i=0;i<objCount;i++){ const base=bank[i% bank.length]; let opts=shuffle([...base.o]).slice(0,finalOpts.length); if(!opts.includes(base.o[0])) opts[0]=base.o[0]; let qT=`${i+1}. ${base.q} [${marks.objPer} marks]`; opts.forEach((op,idx)=>{ qT+=`\n${finalOpts[idx]}. ${op}` }); objectives.push(qT); answers.push(`${i+1}. ${finalOpts[opts.indexOf(base.o[0])]}`) }
    let theories=Array.from({length:theoryCount},(_,i)=> `${i+1}. Explain ${topics||subj} in detail. [${marks.theoryPer} marks]`)
    return { subject:subj, title:`${examType} - ${subj} - ${className}`, objectives, theories, answers, source:'📚 Local' }
  }

  const generate = async ()=>{
    if(!topics.trim()){ alert('Enter topics!'); return }
    setLoading(true); setBulkMode(false)
    const res=await genSingleForSubject(subject)
    setGenerated(res); setSource(res.source); setLoading(false)
  }

  const generateBulk = async ()=>{
    if(selectedBulkSubs.length===0){ alert('Tick at least 1 subject!'); return }
    setBulkLoading(true); setBulkMode(true); setGenerated(null)
    const results=[]
    for(let subj of selectedBulkSubs){
      const r=await genSingleForSubject(subj)
      results.push(r)
    }
    setBulkResults(results); setBulkLoading(false)
  }

  const toggleBulkSub = (sub)=>{ setSelectedBulkSubs(prev=> prev.includes(sub)? prev.filter(s=>s!==sub) : [...prev, sub]) }

  const downloadBulkWord = ()=>{
    if(!bulkResults.length) return
    let html=`<html><body style="font-family:Arial;padding:20px"><center><h1>ANAJI M/A BASIC SCHOOL</h1><h2>${examType} - ${className} - ALL SUBJECTS BULK (${selectedBulkSubs.length})</h2><p>Class: ${className} | Total Subjects: ${teacherSubs.length} | Selected: ${selectedBulkSubs.length}</p></center><hr/>`
    bulkResults.forEach((res, idx)=>{
      html+=`<div style="${idx>0?'page-break-before:always':''}"><center><h2>${res.title} | ${res.source}</h2></center><h3>SECTION A [${marks.objTotal}]</h3>${res.objectives.map(q=>`<p style="white-space:pre-line">${q}</p>`).join('')}<h3>SECTION B [${marks.theoryTotal}]</h3>${res.theories.map(q=>`<p>${q}</p>`).join('')}</div>`
    })
    html+=`<div style="page-break-before:always"><h1>ANSWER KEYS - ALL ${selectedBulkSubs.length} SUBJECTS - TEACHER ONLY</h1>`
    bulkResults.forEach(res=>{ html+=`<h3>${res.subject} - ANSWER KEY</h3>${res.answers.map(a=>`<p>${a}</p>`).join('')}<hr/>` })
    html+=`</div></body></html>`
    const blob=new Blob([html],{type:'application/msword'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`BULK-${className}-${selectedBulkSubs.length}Subjects-${examType}.doc`; a.click()
  }

  return (
    <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:16}}>
      <div style={{maxWidth:1150, margin:'0 auto'}}>
        <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:'800'}}>‹ Back</button>
        <h2 style={{marginTop:10, fontWeight:'900'}}>📝 Exams - {className} - {teacherSubs.length} Subjects in class ✓</h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:16, marginTop:12}}>
          <div style={{background:'#151E32', border:'1px solid #2A3552', borderRadius:16, padding:14, height:'fit-content'}}>
            <div style={{fontSize:10, background:'#1E293B', padding:6, borderRadius:6, marginBottom:8}}>Class: <b>{className}</b> | Subjects in class: <b>{teacherSubs.length}</b></div>
            <select value={examType} onChange={e=>setExamType(e.target.value)} style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white', marginBottom:8}}>{EXAM_TYPES.map(t=><option key={t}>{t}</option>)}</select>
            <select value={subject} onChange={e=>setSubject(e.target.value)} style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white', marginBottom:8}}>{teacherSubs.map(s=><option key={s}>{s}</option>)}</select>
            <textarea value={topics} onChange={e=>setTopics(e.target.value)} rows={2} placeholder="e.g. Photosynthesis" style={{width:'100%', background:'#0F172A', border:'1px solid #4ADE80', borderRadius:10, padding:10, color:'white', marginBottom:10}}/>

            <div style={{background:'#0F172A', borderRadius:10, padding:10, marginBottom:10, border:'1px solid #10B981'}}>
              <div style={{fontSize:10, fontWeight:'900', color:'#10B981'}}>✓ ALL SUBJECTS IN {className.toUpperCase()} - TICK TO BULK ({teacherSubs.length} total)</div>
              <div style={{maxHeight:180, overflowY:'auto', display:'grid', gridTemplateColumns:'1fr', gap:4, marginTop:8}}>
                {teacherSubs.map(sub=>(
                  <label key={sub} style={{display:'flex', alignItems:'center', gap:6, background:selectedBulkSubs.includes(sub)?'#064E3B':'#1E293B', padding:'6px 8px', borderRadius:8, fontSize:11, cursor:'pointer', border:selectedBulkSubs.includes(sub)?'1px solid #10B981':'1px solid #334155'}}>
                    <input type="checkbox" checked={selectedBulkSubs.includes(sub)} onChange={()=>toggleBulkSub(sub)} />
                    {sub}
                  </label>
                ))}
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
                <button onClick={()=>setSelectedBulkSubs(teacherSubs)} style={{background:'#10B981', color:'white', border:'none', borderRadius:6, padding:'4px 8px', fontSize:10, fontWeight:'800'}}>Select All {teacherSubs.length}</button>
                <button onClick={()=>setSelectedBulkSubs([])} style={{background:'#1E293B', color:'white', border:'1px solid #334155', borderRadius:6, padding:'4px 8px', fontSize:10}}>Clear</button>
              </div>
            </div>

            <button onClick={generate} disabled={loading||bulkLoading} style={{width:'100%', background:'#F59E0B', color:'black', padding:13, borderRadius:12, border:'none', fontWeight:'900', marginBottom:8}}>{loading?'⏳...':`🚀 GENERATE ${subject}`}</button>
            <button onClick={generateBulk} disabled={loading||bulkLoading} style={{width:'100%', background:'#10B981', color:'white', padding:13, borderRadius:12, border:'none', fontWeight:'900'}}>{bulkLoading?`⏳ BULK ${bulkResults.length}/${selectedBulkSubs.length}...`:`⚡ BULK ${selectedBulkSubs.length} SUBJECTS`}</button>
          </div>

          <div style={{background:'white', color:'black', borderRadius:16, padding:16, maxHeight:'92vh', overflowY:'auto'}}>
            {bulkResults.length===0 &&!generated && <div style={{textAlign:'center', padding:40, color:'#64748B'}}>Class {className} has {teacherSubs.length} subjects<br/>Tick subjects on left<br/>Click BULK {selectedBulkSubs.length} SUBJECTS</div>}
            {bulkMode && bulkResults.length>0 && <div>
              <h3>BULK - {className} - {bulkResults.length}/{teacherSubs.length} SUBJECTS ✓</h3>
              {bulkResults.map((res,i)=><div key={i} style={{border:'1px solid #E2E8F0', borderRadius:8, padding:8, marginTop:8}}><b>{i+1}. {res.subject}</b> - {res.source}</div>)}
              <button onClick={downloadBulkWord} style={{width:'100%', marginTop:12, padding:12, background:'black', color:'white', borderRadius:10, border:'none', fontWeight:'900'}}>📥 Download BULK Word ({selectedBulkSubs.length} subjects)</button>
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}