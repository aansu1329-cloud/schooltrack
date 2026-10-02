import { useState } from "react";

export default function TeacherManagement({ teachers, setTeachers, classes, setClasses, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [assignedClass, setAssignedClass] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("123456");

  const handleAddTeacher = () => {
    if (!name.trim() ||!assignedClass.trim()) {
      alert("Enter Name and Class"); return;
    }
    const classUpper = assignedClass.toUpperCase().trim();

    // 1. Auto create class - THIS FIXES 5A ONLY PROBLEM
    if (!classes.some(c => c.name.toUpperCase() === classUpper)) {
      const newClassObj = { id: Date.now(), name: classUpper, school: 'Martyrs of Uganda R/C JHS', level: classUpper };
      setClasses([...classes, newClassObj]);
    }

    // 2. Create teacher
    const newTeacher = {
      id: Date.now(),
      username: email.split('@')[0] || name,
      name: name.trim(),
      email: email.trim().toLowerCase() || `${name.toLowerCase().replace(' ', '')}@school.com`,
      password: password,
      role: 'TEACHER',
      isClassTeacher: true,
      assignedClass: classUpper,
      school: 'Martyrs of Uganda R/C JHS',
      subjects: []
    };

    setTeachers([...teachers, newTeacher]);
    setName(""); setEmail(""); setAssignedClass(""); setPassword("123456");
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

        <h2 style={{marginTop:20}}>Teachers Management - {classes.length} Classes Available</h2>
        <p style={{color:'#94A3B8', fontSize:12}}>Type any class: KG1, 6A, JHS1 — it will auto-create</p>

        <div style={{marginTop:18, display:'grid', gap:12}}>
          {teachers.map(t => (
            <div key={t.id} style={{background:'#151E32', padding:16, borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #23304D'}}>
              <div>
                <div style={{fontWeight:'800'}}>{t.name} - <span style={{color:'#F59E0B'}}>{t.assignedClass}</span> - {t.role}</div>
                <div style={{fontSize:11, color:'#94A3B8'}}>{t.email}</div>
              </div>
              <button onClick={() => handleDelete(t.id)} style={{background:'#DC2626', color:'white', padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer'}}>Delete</button>
            </div>
          ))}
        </div>

        {showModal && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99}}>
            <div style={{background:'#151E32', padding:20, borderRadius:16, width:'90%', maxWidth:420, border:'1px solid #2A3552'}}>
              <h3 style={{fontWeight:'800', fontSize:18}}>Add Teacher - No Dropdown</h3>
              <div style={{marginTop:14}}>
                <div style={{fontSize:12, marginBottom:4}}>Teacher Name *</div>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Mr. John" style={{width:'100%', padding:10, borderRadius:8, background:'#0F172A', border:'1px solid #2A3552', color:'white'}}/>
              </div>
              <div style={{marginTop:10}}>
                <div style={{fontSize:12, marginBottom:4}}>Email</div>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="teacher@school.com" style={{width:'100%', padding:10, borderRadius:8, background:'#0F172A', border:'1px solid #2A3552', color:'white'}}/>
              </div>
              <div style={{marginTop:10}}>
                <div style={{fontSize:12, marginBottom:4, color:'#FBBF24', fontWeight:'800'}}>Class - TYPE IT * (KG1, 6A, JHS1, 5A)</div>
                <input value={assignedClass} onChange={e=>setAssignedClass(e.target.value)} placeholder="TYPE class here e.g. 6B" style={{width:'100%', padding:12, borderRadius:8, background:'white', border:'2px solid #F59E0B', color:'black', fontWeight:'800'}}/>
              </div>
              <div style={{display:'flex', gap:10, marginTop:16}}>
                <button onClick={handleAddTeacher} style={{flex:1, background:'#F59E0B', color:'black', padding:12, borderRadius:100, border:'none', fontWeight:'800', cursor:'pointer'}}>Save</button>
                <button onClick={()=>setShowModal(false)} style={{flex:1, background:'#1E293B', color:'white', padding:12, borderRadius:100, border:'none', cursor:'pointer'}}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}