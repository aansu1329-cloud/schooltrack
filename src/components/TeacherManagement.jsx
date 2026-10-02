import { useState } from 'react'

export default function TeacherManagement({ teachers, setTeachers, onBack }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [className, setClassName] = useState('')
  const [phone, setPhone] = useState('')
  const [search, setSearch] = useState('')

  const filtered = teachers.filter(t =>
    `${t.name} ${t.email} ${t.assignedClass}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = () => {
    if(!name.trim() ||!email.trim() ||!className.trim()){
      alert('Fill Name, Email and Class'); return
    }
    if(teachers.some(t => t.email.toLowerCase() === email.trim().toLowerCase())){
      alert('Email already exists'); return
    }
    const newTeacher = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      assignedClass: className.trim().toUpperCase(),
      phone: phone.trim(),
      password: '123456',
      school: 'Martyrs of Uganda',
      role: 'TEACHER'
    }
    const updated = [...teachers, newTeacher]
    setTeachers(updated)
    localStorage.setItem('my_teachers_v2', JSON.stringify(updated))

    // Auto create class - fixes 5A only problem
    const oldClasses = JSON.parse(localStorage.getItem('my_classes') || '[]')
    if(!oldClasses.some(c => c.name.toUpperCase() === newTeacher.assignedClass)){
      const newClasses = [...oldClasses, { id: Date.now(), name: newTeacher.assignedClass }]
      localStorage.setItem('my_classes', JSON.stringify(newClasses))
    }

    setName(''); setEmail(''); setClassName(''); setPhone(''); setShowAdd(false)
    alert(`Added ${newTeacher.name} to ${newTeacher.assignedClass}`)
  }

  const handleDelete = (id, tName) => {
    if(!confirm(`Delete ${tName}? He cannot login again.`)) return
    const updated = teachers.filter(t => t.id!== id)
    setTeachers(updated)
    localStorage.setItem('my_teachers_v2', JSON.stringify(updated))
  }

  const uniqueClasses = [...new Set(teachers.map(t => t.assignedClass))].length

  return (
    <div style={{ minHeight: '100vh', background: '#0B1222', color: 'white', padding: 16 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ background: '#1E293B', color: 'white', width: 36, height: 36, borderRadius: 12, border: 'none' }}>‹</button>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Headteacher Dashboard</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Only Headteacher • Manage all teachers</div>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ background: '#F59E0B', color: 'black', padding: '10px 18px', borderRadius: 100, border: 'none', fontWeight: 800 }}>+ Add Teacher</button>
        </div>

        {/* Stats Cards - Same as your screenshot */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
          <div style={{ background: '#151E32', padding: 16, borderRadius: 16, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: 10, color: '#94A3B8' }}>TOTAL TEACHERS</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{teachers.length}</div>
          </div>
          <div style={{ background: '#151E32', padding: 16, borderRadius: 16, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: 10, color: '#94A3B8' }}>CLASSES</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{uniqueClasses} Classes</div>
          </div>
          <div style={{ background: '#151E32', padding: 16, borderRadius: 16, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: 10, color: '#94A3B8' }}>SCHOOL</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Martyrs of Uganda</div>
          </div>
        </div>

        {/* List */}
        <div style={{ marginTop: 16, background: '#151E32', borderRadius: 16, border: '1px solid #1E293B', padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>All Teachers</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: '#0F172A', border: '1px solid #23304D', color: 'white', padding: '8px 12px', borderRadius: 10, width: 120, fontSize: 12 }} />
          </div>

          {filtered.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', borderBottom: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 100, background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name} {t.role === 'OWNER' && '👑'}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>{t.email} • {t.assignedClass} • {t.phone || 'No phone'} • Pass: {t.password || '123456'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ background: '#1E293B', padding: '4px 10px', borderRadius: 100, fontSize: 10 }}>{t.assignedClass}</div>
                {t.role!== 'OWNER' && (
                  <button onClick={() => handleDelete(t.id, t.name)} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal - NO DROPDOWN */}
        {showAdd && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 99 }}>
            <div style={{ background: '#151E32', padding: 20, borderRadius: 20, width: '100%', maxWidth: 400, border: '1px solid #23304D' }}>
              <h3 style={{ margin: 0 }}>Add Teacher - No Dropdown</h3>
              <p style={{ fontSize: 11, color: '#94A3B8' }}>Type any class: KG1, KG2, 3A, 5A, 6A, JHS1</p>

              <div style={{ marginTop: 12 }}><div style={{ fontSize: 12 }}>Name *</div><input value={name} onChange={e => setName(e.target.value)} placeholder="Mr. Mensah" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#0F172A', border: '1px solid #2A3552', color: 'white', marginTop: 4 }} /></div>
              <div style={{ marginTop: 10 }}><div style={{ fontSize: 12 }}>Email *</div><input value={email} onChange={e => setEmail(e.target.value)} placeholder="mensah@school.com" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#0F172A', border: '1px solid #2A3552', color: 'white', marginTop: 4 }} /></div>
              <div style={{ marginTop: 10 }}><div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 800 }}>Class - TYPE IT * (No dropdown)</div><input value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g KG1, 5A, 6A, JHS1" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#0F172A', border: '2px solid #F59E0B', color: 'white', marginTop: 4, fontWeight: 800 }} /></div>
              <div style={{ marginTop: 10 }}><div style={{ fontSize: 12 }}>Phone</div><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="054..." style={{ width: '100%', padding: 12, borderRadius: 10, background: '#0F172A', border: '1px solid #2A3552', color: 'white', marginTop: 4 }} /></div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 12, borderRadius: 100, background: '#1E293B', color: 'white', border: 'none' }}>Cancel</button>
                <button onClick={handleAdd} style={{ flex: 1, padding: 12, borderRadius: 100, background: 'white', color: 'black', border: 'none', fontWeight: 800 }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}