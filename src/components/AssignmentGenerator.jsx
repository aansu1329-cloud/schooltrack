import { useState } from 'react'

const CLASSES = ['KG1','KG2','Basic 1','Basic 2','Basic 3','Basic 4','Basic 5','Basic 6','JHS 1','JHS 2','JHS 3']
const SUBJECTS = ['Mathematics','English Language','Integrated Science','Social Studies','RME','Creative Arts','Computing','French','Twi','BDT','Career Tech']
const DIFFICULTIES = ['Easy','Normal','Hard']

export default function AssignmentGenerator({ activeClass, onBack }){
  const [classLevel, setClassLevel] = useState(activeClass?.name||'JHS 2')
  const [subject, setSubject] = useState('Mathematics')
  const [difficulty, setDifficulty] = useState('Normal')
  const [type, setType] = useState('Homework')
  const [num, setNum] = useState(10)
  const [generated, setGenerated] = useState(null)

  const generate = ()=>{
    const bank = {
      Easy: ["Define the term","Mention 2 examples","List 3 uses","What is...?"],
      Normal: ["Explain with examples","Describe the process","State 3 differences","Give 2 reasons"],
      Hard: ["Explain in detail with diagram","Calculate and show workings - BECE style","Discuss with examples","Analyze the effects"]
    }
    const qs = bank[difficulty]
    const list = []
    for(let i=0;i<num;i++) list.push(`${i+1}. ${qs[i%qs.length]} of ${subject} - ${subject} topic ${i+1}`)
    setGenerated({
      title: `${type.toUpperCase()} - ${subject.toUpperCase()} - ${classLevel}`,
      sub: `Difficulty: ${difficulty} • ${type} • ${new Date().toLocaleDateString()}`,
      questions: list
    })
  }

  return (
    <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:16}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 16px', borderRadius:100, border:'none', fontWeight:'800'}}>‹ Back</button>
        <h1 style={{marginTop:16, fontWeight:'900', fontSize:20}}>📚 CARD 4: Assignments / Class Test Generator</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16}}>
          <div style={{background:'#151E32', border:'1px solid #2A3552', borderRadius:16, padding:16}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <div><div style={{fontSize:11, fontWeight:'700', marginBottom:6}}>Type</div><select value={type} onChange={e=>setType(e.target.value)} style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white'}}><option>Homework</option><option>Class Exercise</option><option>Class Test</option><option>Weekly Assignment</option></select></div>
              <div><div style={{fontSize:11, fontWeight:'700', marginBottom:6}}>Difficulty</div><select value={difficulty} onChange={e=>setDifficulty(e.target.value)} style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white'}}>{DIFFICULTIES.map(d=> <option key={d}>{d}</option>)}</select></div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12}}>
              <div><div style={{fontSize:11, fontWeight:'700', marginBottom:6}}>Class</div><select value={classLevel} onChange={e=>setClassLevel(e.target.value)} style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white'}}>{CLASSES.map(c=> <option key={c}>{c}</option>)}</select></div>
              <div><div style={{fontSize:11, fontWeight:'700', marginBottom:6}}>Subject</div><select value={subject} onChange={e=>setSubject(e.target.value)} style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:10, color:'white'}}>{SUBJECTS.map(s=> <option key={s}>{s}</option>)}</select></div>
            </div>
            <div style={{marginTop:12}}><div style={{fontSize:11, fontWeight:'700', marginBottom:6}}>Number: {num}</div><input type="range" min="5" max="30" value={num} onChange={e=>setNum(Number(e.target.value))} style={{width:'100%'}}/></div>
            <button onClick={generate} style={{width:'100%', marginTop:16, background:'#C084FC', color:'black', padding:14, borderRadius:12, border:'none', fontWeight:'900', cursor:'pointer'}}>🚀 GENERATE {type.toUpperCase()}</button>
          </div>
          <div style={{background:'white', color:'black', borderRadius:16, padding:20, minHeight:500}}>
            {!generated? <div style={{textAlign:'center', padding:60, color:'#94A3B8'}}><div style={{fontSize:40}}>📚</div><div style={{marginTop:10, fontWeight:'800'}}>Select and Generate</div></div> : (
              <div>
                <div style={{textAlign:'center', borderBottom:'2px solid black', paddingBottom:10}}><div style={{fontWeight:'900', fontSize:16}}>{generated.title}</div><div style={{fontSize:11, marginTop:4}}>{generated.sub}</div></div>
                <div style={{marginTop:16, fontSize:13, lineHeight:1.8}}>
                  {generated.questions.map((q,i)=> <div key={i} style={{marginBottom:6}}>{q}</div>)}
                </div>
                <button onClick={()=>window.print()} style={{width:'100%', marginTop:16, background:'black', color:'white', padding:12, borderRadius:10, border:'none', fontWeight:'900'}}>🖨️ Print / PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}