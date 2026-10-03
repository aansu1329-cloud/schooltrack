import { useState } from "react";
import { allSubjectsList } from "../data/mockData.js";

const COMMON_GHANA_CLASSES = [
  "KG1","KG2","KG1A","KG1B","KG2A","KG2B",
  "Basic 1","Basic 2","Basic 3","Basic 4","Basic 5","Basic 6",
  "Basic 1A","Basic 2A","Basic 3A","Basic 4A","Basic 5A","Basic 6A",
  "JHS 1","JHS 2","JHS 3","JHS 1A","JHS 2A","JHS 3A"
];

export default function TeacherManagement({ teachers, setTeachers, classes, setClasses, onBack }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [showModal, setShowModal] = useState(false);
  const [assignments, setAssignments] = useState([{ id: 1, className: "", subject: "", customSubject: "" }]);
  const [activeSuggestFor, setActiveSuggestFor] = useState(null);

  const getClassSuggestions = (input) => {
    const val = input.toUpperCase().trim();
    if(!val) return [];
    const existing = classes.map(c=>c.name);
    const all = [...new Set([...existing,...COMMON_GHANA_CLASSES])];
    return all.filter(c=> c.toUpperCase().includes(val)).slice(0,6);
  };

  const handleAddAssignment = () => {
    setAssignments([...assignments, { id: Date.now(), className: "", subject: "", customSubject: "" }]);
  };
  const handleRemoveAssignment = (id) => {
    if(assignments.length===1) return alert("At least one assignment needed");
    setAssignments(assignments.filter(a=>a.id!==id));
  };
  const updateAssignment = (id, field, value) => {
    setAssignments(assignments.map(a=> a.id===id? {...a, [field]: value}: a));
  };

  const handleAddTeacher = () => {
    const fName = firstName.trim();
    const lName = lastName.trim();
    const phoneClean = phone.trim().replace(/\s/g,'');
    if (!fName ||!lName ||!phoneClean) {
      alert("Enter First Name, Last Name and Phone"); return;
    }
    const validAssignments = assignments.filter(a=> a.className.trim() && (a.subject.trim() || a.customSubject.trim()));
    if(validAssignments.length===0){
      alert("Add at least one Class + Subject"); return;
    }
    let updatedClasses = [...classes];
    validAssignments.forEach(ass=>{
      const classUpper = ass.className.toUpperCase().trim();
      if (!updatedClasses.some(c => c.name.toUpperCase() === classUpper)) {
        const newClassObj = { id: Date.now()+Math.random(), name: classUpper, school: 'Martyrs of Uganda R/C JHS', level: classUpper };
        updatedClasses.push(newClassObj);
      }
    });
    setClasses(updatedClasses);
    const finalAssignments = validAssignments.map(a=>({
      className: a.className.toUpperCase().trim(),
      subject: a.customSubject.trim() || a.subject.trim()
    }));
    const fullName = `${fName} ${lName}`.trim();
    if(teachers.some(t=> (t.phone||'').replace(/\s/g,'')===phoneClean)){
      alert("Phone already exists!"); return;
    }
    const newTeacher = {
      id: Date.now(),
      name: fullName,
      firstName: fName,
      lastName: lName,
      email: email.trim().toLowerCase() || `${fName.toLowerCase()}@school.com`,
      phone: phoneClean,
      password: password,
      role: 'TEACHER',
      assignedClass: finalAssignments[0].className,
      assignedClasses: finalAssignments.map(f=>f.className),
      assignments: finalAssignments,
      subjects: finalAssignments.map(f=>f.subject),
      school: 'Martyrs of Uganda R/C JHS',
    };
    setTeachers([...teachers, newTeacher]);
    setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setPassword("123456");
    setAssignments([{ id: 1, className: "", subject: "", customSubject: "" }]);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this teacher?")) {
      setTeachers(teachers.filter(t => t.id!== id));
    }
  };

  return (
    <div style={{minHeight:'100vh', background:'#0B1222', color:'white', padding:20}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <button onClick={onBack} style={{background:'white', color:'black', padding:'8px 18px', borderRadius:100, border:'none', fontWeight:'700', cursor:'pointer'}}>‹ Back</button>
          <button onClick={() => setShowModal(true)} style={{background:'#F59E0B', color:'black', padding:'10px 18px', borderRadius:100, border:'none', fontWeight:'800', cursor:'pointer'}}>+ Add Teacher</button>
        </div>
        <h2 style={{marginTop:20}}>Teachers - {classes.length} Classes</h2>
        <p style={{color:'#94A3B8', fontSize:11}}>One teacher = Many classes • Phone = Login</p>
        <div style={{marginTop:18, display:'grid', gap:12}}>
          {teachers.map(t => (
            <div key={t.id} style={{background:'#151E32', padding:16, borderRadius:12, display:'flex', justifyContent:'space-between', border:'1px solid #23304D'}}>
              <div><div style={{fontWeight:'800'}}>{t.name} - <span style={{color:'#F59E0B'}}>{t.assignedClasses? t.assignedClasses.join(', ') : t.assignedClass}</span></div><div style={{fontSize:11, color:'#94A3B8'}}>📱 {t.phone} • {t.assignments?.map(a=> `${a.className}:${a.subject}`).join(' | ')}</div></div>
              <button onClick={() => handleDelete(t.id)} style={{background:'#DC2626', color:'white', padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer'}}>Delete</button>
            </div>
          ))}
        </div>
        {showModal && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99, padding:16}}>
            <div style={{background:'#151E32', padding:20, borderRadius:16, width:'100%', maxWidth:520, border:'1px solid #2A3552', maxHeight:'90vh', overflowY:'auto'}}>
              <h3 style={{fontWeight:'900'}}>Add Teacher - Multi Class</h3>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14}}>
                <div><div style={{fontSize:11}}>First Name *</div><input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Kofi" style={{width:'100%', padding:10, borderRadius:8, background:'#0F172A', border:'1px solid #2A3552', color:'white'}}/></div>
                <div><div style={{fontSize:11}}>Last Name *</div><input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Mensah" style={{width:'100%', padding:10, borderRadius:8, background:'#0F172A', border:'1px solid #2A3552', color:'white'}}/></div>
              </div>
              <div style={{marginTop:10}}><div style={{fontSize:11, color:'#FBBF24', fontWeight:'800'}}>Phone * (Login)</div><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0244123456" style={{width:'100%', padding:12, borderRadius:8, background:'white', border:'2px solid #F59E0B', color:'black', fontWeight:'800'}}/></div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}><div><div style={{fontSize:11}}>Email</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="teacher@school.com" style={{width:'100%', padding:10, borderRadius:8, background:'#0F172A', border:'1px solid #2A3552', color:'white'}}/></div><div><div style={{fontSize:11}}>Password</div><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="123456" style={{width:'100%', padding:10, borderRadius:8, background:'#0F172A', border:'1px solid #2A3552', color:'white'}}/></div></div>
              <div style={{marginTop:16, borderTop:'1px solid #23304D', paddingTop:14}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><div style={{fontWeight:'800', fontSize:13}}>Assignments *</div><button onClick={handleAddAssignment} style={{background:'#1E293B', color:'#FBBF24', border:'1px solid #F59E0B', padding:'4px 10px', borderRadius:100, fontSize:11, cursor:'pointer'}}>+ Add Another Class</button></div>
                {assignments.map((ass, idx)=>(
                  <div key={ass.id} style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:12, padding:12, marginTop:10, position:'relative'}}>
                    <div style={{fontSize:10, color:'#94A3B8'}}>ASSIGNMENT {idx+1}</div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:6}}>
                      <div style={{position:'relative'}}><div style={{fontSize:10}}>Class TYPE *</div><input value={ass.className} onChange={e=>{updateAssignment(ass.id, 'className', e.target.value); setActiveSuggestFor(ass.id)}} onFocus={()=>setActiveSuggestFor(ass.id)} placeholder="JHS2A" style={{width:'100%', padding:9, borderRadius:8, background:'#1E293B', border:'1px solid #3B82F6', color:'white', fontWeight:'700', fontSize:12}}/>
                        {activeSuggestFor===ass.id && ass.className && (
                          <div style={{position:'absolute', top:52, left:0, right:0, background:'#1E293B', border:'1px solid #3B82F6', borderRadius:8, zIndex:10}}>{getClassSuggestions(ass.className).map(s=>(<div key={s} onClick={()=>{updateAssignment(ass.id, 'className', s); setActiveSuggestFor(null)}} style={{padding:'8px 10px', cursor:'pointer', fontSize:11, borderBottom:'1px solid #23304D'}}>{s}</div>))}<div onClick={()=>setActiveSuggestFor(null)} style={{padding:'6px', textAlign:'center', fontSize:10, color:'#64748B'}}>Close</div></div>
                        )}
                      </div>
                      <div><div style={{fontSize:10}}>Subject *</div><input list={`subj-${ass.id}`} value={ass.subject} onChange={e=>updateAssignment(ass.id, 'subject', e.target.value)} placeholder="Maths" style={{width:'100%', padding:9, borderRadius:8, background:'#1E293B', border:'1px solid #2A3552', color:'white', fontSize:12}}/><datalist id={`subj-${ass.id}`}>{allSubjectsList.map(s=> <option key={s} value={s}/>)}</datalist></div>
                    </div>
                    <div style={{marginTop:6}}><input value={ass.customSubject} onChange={e=>updateAssignment(ass.id, 'customSubject', e.target.value)} placeholder="+ Custom e.g. Twi" style={{width:'100%', padding:8, borderRadius:6, background:'transparent', border:'1px dashed #475569', color:'#94A3B8', fontSize:10}}/></div>
                    {assignments.length>1 && <button onClick={()=>handleRemoveAssignment(ass.id)} style={{position:'absolute', top:6, right:8, background:'transparent', color:'#EF4444', border:'none', cursor:'pointer'}}>✕</button>}
                  </div>
                ))}
              </div>
              <div style={{display:'flex', gap:10, marginTop:18}}><button onClick={handleAddTeacher} style={{flex:1, background:'#F59E0B', color:'black', padding:12, borderRadius:100, border:'none', fontWeight:'900', cursor:'pointer'}}>Save Teacher</button><button onClick={()=>setShowModal(false)} style={{flex:1, background:'#1E293B', color:'white', padding:12, borderRadius:100, border:'none', cursor:'pointer'}}>Cancel</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}