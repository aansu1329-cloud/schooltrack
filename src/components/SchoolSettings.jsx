import { useState, useEffect } from 'react'

export default function SchoolSettings({ onBack }){
  const [form, setForm] = useState(()=>{
    try{
      const s = localStorage.getItem('schoolInfo_v1')
      return s? JSON.parse(s) : {
        schoolName: 'Martyrs of Uganda R/C KG/Prim. A, Drobonso',
        headName: 'John Atta Junior',
        district: 'Sekyere Afram Plains Drobonso',
        phone: '0547940291',
        email: 'attajohn98@gmail.com',
        location: 'Near Martyrs Of Uganda Rectorate',
        logo: '',
        signature: ''
      }
    }catch{
      return {
        schoolName: '', headName: '', district: '', phone: '', email: '', location: '', logo: '', signature: ''
      }
    }
  })

  const [logoPreview, setLogoPreview] = useState(form.logo)
  const [sigPreview, setSigPreview] = useState(form.signature)

  useEffect(()=>{
    setLogoPreview(form.logo)
    setSigPreview(form.signature)
  },[])

  const handleChange = (field, value)=>{
    setForm(prev=> ({...prev, [field]: value}))
  }

  const handleFile = (e, type)=>{
    const file = e.target.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onloadend = ()=>{
      const base64 = reader.result
      if(type==='logo'){
        setLogoPreview(base64)
        setForm(prev=> ({...prev, logo: base64}))
      }else{
        setSigPreview(base64)
        setForm(prev=> ({...prev, signature: base64}))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = ()=>{
    if(!form.schoolName.trim()){ alert('School Name is required'); return }
    localStorage.setItem('schoolInfo_v1', JSON.stringify(form))
    alert('✅ School Information saved! Logo & Signature will now appear on all reports and all classes.')
    onBack()
  }

  const clearLogo = ()=>{
    setLogoPreview(''); setForm(prev=> ({...prev, logo:''}))
  }
  const clearSig = ()=>{
    setSigPreview(''); setForm(prev=> ({...prev, signature:''}))
  }

  return (
    <div style={{minHeight:'100vh', background:'#0A0F1E', color:'white', padding:16}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:20}}>
          <button onClick={onBack} style={{width:40, height:40, borderRadius:12, background:'#1A2236', border:'1px solid #2A3552', color:'white', cursor:'pointer'}}>‹</button>
          <div><div style={{fontWeight:'800', fontSize:20}}>School Settings</div><div style={{fontSize:11, color:'#94A3B8'}}>This is MASTER COPY for all classes - only Headteacher can edit</div></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          {/* LEFT - SCHOOL INFORMATION */}
          <div style={{background:'#151A2E', border:'1px solid #1E293B', borderRadius:16, padding:18}}>
            <div style={{fontWeight:'800', fontSize:13, letterSpacing:0.5, marginBottom:16, color:'#E2E8F0'}}>SCHOOL INFORMATION</div>

            <div style={{marginBottom:12}}>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6, display:'flex', gap:4}}><span>🏫</span> School Name <span style={{color:'#EF4444'}}>*</span></div>
              <input value={form.schoolName} onChange={e=>handleChange('schoolName', e.target.value)} placeholder="Martyrs of Uganda R/C KG/Prim. 'A', Droboso" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
              <div>
                <div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>👤 Head Teacher Name</div>
                <input value={form.headName} onChange={e=>handleChange('headName', e.target.value)} placeholder="John Atta Junior" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
              </div>
              <div>
                <div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>📍 District</div>
                <input value={form.district} onChange={e=>handleChange('district', e.target.value)} placeholder="Sekyere Afram Plains Drobonso" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
              <div>
                <div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>📞 Phone Number</div>
                <input value={form.phone} onChange={e=>handleChange('phone', e.target.value)} placeholder="0547940291" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
              </div>
              <div>
                <div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>✉️ Email Address</div>
                <input value={form.email} onChange={e=>handleChange('email', e.target.value)} placeholder="attajohn98@gmail.com" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
              </div>
            </div>

            <div style={{marginBottom:12}}>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:6}}>📍 Precise Location</div>
              <input value={form.location} onChange={e=>handleChange('location', e.target.value)} placeholder="Near Martyrs Of Uganda Rectorate" style={{width:'100%', background:'#0F172A', border:'1px solid #2A3552', borderRadius:10, padding:12, color:'white', fontSize:13}}/>
            </div>

            <div style={{marginTop:16, background:'#0F172A', borderRadius:10, padding:12, fontSize:11, color:'#94A3B8', border:'1px solid #1E293B'}}>
              ✅ This information will automatically appear on:<br/>
              • All classes 5A, 6A, etc<br/>
              • Attendance Register printout<br/>
              • Terminal Reports & Broadsheets
            </div>
          </div>

          {/* RIGHT - LOGO & SIGNATURE */}
          <div style={{background:'#151A2E', border:'1px solid #1E293B', borderRadius:16, padding:18}}>
            <div style={{fontWeight:'800', fontSize:13, letterSpacing:0.5, marginBottom:16, color:'#E2E8F0'}}>LOGO & SIGNATURE</div>

            <div style={{marginBottom:18}}>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:8}}>🏫 School Logo</div>
              <div style={{border:'1.5px dashed #2A3552', borderRadius:12, padding:16, background:'#0F172A', minHeight:140, display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
                {logoPreview? (
                  <>
                    <img src={logoPreview} style={{maxWidth:100, maxHeight:100, borderRadius:10, background:'white', padding:6}}/>
                    <button onClick={clearLogo} style={{position:'absolute', top:8, right:8, width:22, height:22, borderRadius:100, background:'#1E293B', color:'white', border:'1px solid #334155', cursor:'pointer', fontSize:12}}>✕</button>
                  </>
                ) : (
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:12, color:'#94A3B8'}}>No logo yet</div>
                    <div style={{fontSize:10, color:'#475569', marginTop:4}}>PNG, JPG recommended</div>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={e=>handleFile(e,'logo')} style={{marginTop:10, fontSize:11}}/>
            </div>

            <div style={{marginBottom:18}}>
              <div style={{fontSize:11, fontWeight:'600', marginBottom:8}}>✍️ Head Teacher Signature</div>
              <div style={{border:'1.5px dashed #2A3552', borderRadius:12, padding:16, background:'#0F172A', minHeight:140, display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
                {sigPreview? (
                  <>
                    <img src={sigPreview} style={{maxWidth:140, maxHeight:90, borderRadius:10, background:'white', padding:8}}/>
                    <button onClick={clearSig} style={{position:'absolute', top:8, right:8, width:22, height:22, borderRadius:100, background:'#1E293B', color:'white', border:'1px solid #334155', cursor:'pointer', fontSize:12}}>✕</button>
                  </>
                ) : (
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:12, color:'#94A3B8'}}>No signature yet</div>
                    <div style={{fontSize:10, color:'#475569', marginTop:4}}>Upload signature image</div>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={e=>handleFile(e,'signature')} style={{marginTop:10, fontSize:11}}/>
            </div>

            <button onClick={handleSave} style={{width:'100%', background:'white', color:'black', padding:14, borderRadius:100, border:'none', fontWeight:'800', fontSize:13, cursor:'pointer', marginTop:8}}>💾 Save School Information</button>
            <div style={{fontSize:10, color:'#475569', textAlign:'center', marginTop:10}}>Saved locally - will be included in all reports automatically</div>
          </div>
        </div>
      </div>
    </div>
  )
}