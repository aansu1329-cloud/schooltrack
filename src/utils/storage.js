// FIX FOR MULTI-SCHOOL BUG - All data isolated by schoolId

export const getActiveSchoolId = () => localStorage.getItem('activeSchoolId')

export const setActiveSchoolId = (schoolId) => {
  localStorage.setItem('activeSchoolId', schoolId)
}

export const clearActiveSchoolId = () => {
  localStorage.removeItem('activeSchoolId')
  localStorage.removeItem('currentUser_v3')
}

// This makes keys like sch_123_my_classes
export const getKey = (base) => {
  const sid = getActiveSchoolId()
  return sid ? `${sid}_${base}` : base
}

// For class-specific keys like students_5A, attendance_5A
export const getClassKey = (className, base) => {
  const sid = getActiveSchoolId()
  return sid ? `${sid}_${base}_${className}` : `${base}_${className}`
}

// For v2, v3, v4 keys like students_5A_v2
export const getClassKeyVersioned = (className, base, version) => {
  const sid = getActiveSchoolId()
  return sid ? `${sid}_${base}_${className}_${version}` : `${base}_${className}_${version}`
}

// Find a user across ALL schools (for login)
export const findUserAcrossSchools = (email, password) => {
  for(let i=0; i<localStorage.length; i++){
    const key = localStorage.key(i)
    if(key && key.endsWith('_teachers')){
      try{
        const teachers = JSON.parse(localStorage.getItem(key) || '[]')
        const user = teachers.find(t => 
          t.email.toLowerCase() === email.toLowerCase() && t.password === password
        )
        if(user) return user
      }catch{}
    }
  }
  // fallback old global
  try{
    const old = localStorage.getItem('teachers_5A_v3')
    if(old){
      const teachers = JSON.parse(old)
      return teachers.find(t => t.email.toLowerCase() === email.toLowerCase() && t.password === password)
    }
  }catch{}
  return null
}

// Check if email exists in ANY school
export const emailExistsAnySchool = (email) => {
  for(let i=0; i<localStorage.length; i++){
    const key = localStorage.key(i)
    if(key && key.endsWith('_teachers')){
      try{
        const teachers = JSON.parse(localStorage.getItem(key) || '[]')
        if(teachers.some(t => t.email.toLowerCase() === email.toLowerCase())) return true
      }catch{}
    }
  }
  return false
}