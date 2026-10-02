import {
  getActiveSchoolId,
  setActiveSchoolId,
  clearActiveSchoolId,
  findUserAcrossSchools,
  emailExistsAnySchool
} from './storage.js'

export const generateSchoolId = () => {
  return `sch_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
}

export const loginUser = (email, password) => {
  if(!email.trim() ||!password.trim()){
    return { success: false, message: 'Enter email and password' }
  }
  const user = findUserAcrossSchools(email.trim(), password)
  if(!user){
    return { success: false, message: 'Wrong email or password!' }
  }
  setActiveSchoolId(user.schoolId)
  localStorage.setItem('currentUser_v3', JSON.stringify(user))
  return { success: true, user }
}

export const logoutUser = () => {
  clearActiveSchoolId()
  return { success: true }
}

// REGISTER NEW SCHOOL - NOW 0 CLASSES
export const registerSchool = ({ schoolName, headName, email, password, confirm }) => {
  if(!schoolName.trim() ||!headName.trim() ||!email.trim() ||!password.trim()){
    return { success: false, message: 'Fill all fields' }
  }
  if(password!== confirm){
    return { success: false, message: 'Passwords do not match' }
  }
  if(password.length < 6){
    return { success: false, message: 'Password must be 6+' }
  }
  if(emailExistsAnySchool(email)){
    return { success: false, message: 'Email exists' }
  }

  const schoolId = generateSchoolId()
  const newOwner = {
    id: Date.now(),
    schoolId: schoolId,
    username: email.split('@')[0],
    name: headName.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    plainPassword: password,
    role: 'OWNER',
    isClassTeacher: false,
    assignedClass: '', // NO CLASS
    school: schoolName.trim(),
    subjects: []
  }

  const newClasses = [] // 0 CLASSES AT START AS YOU REQUESTED
  const schoolInfo = {
    schoolName: schoolName.trim(),
    headName: headName.trim(),
    district: '',
    phone: '',
    email: email.trim(),
    location: '',
    logo: '',
    signature: ''
  }

  setActiveSchoolId(schoolId)
  localStorage.setItem(`${schoolId}_schoolInfo_v1`, JSON.stringify(schoolInfo))
  localStorage.setItem(`${schoolId}_my_classes`, JSON.stringify(newClasses))
  localStorage.setItem(`${schoolId}_teachers`, JSON.stringify([newOwner]))
  localStorage.setItem('currentUser_v3', JSON.stringify(newOwner))

  return { success: true, user: newOwner, classes: newClasses }
}

export const registerIndividual = ({ name, email, password }) => {
  if(!name.trim() ||!email.trim() ||!password.trim()){
    return { success: false, message: 'Fill all fields' }
  }
  if(password.length < 6){
    return { success: false, message: 'Password must be 6+' }
  }
  if(emailExistsAnySchool(email)){
    return { success: false, message: 'Email exists' }
  }

  const schoolId = `ind_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
  const myClassName = 'My Class'
  const newTeacher = {
    id: Date.now(),
    schoolId: schoolId,
    username: email.split('@')[0],
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    plainPassword: password,
    role: 'OWNER',
    isClassTeacher: true,
    assignedClass: myClassName,
    school: 'Individual Teacher',
    subjects: []
  }
  const newClasses = [{id: Date.now(), name: myClassName, school: 'Individual Teacher', level: 'MY CLASS'}]

  setActiveSchoolId(schoolId)
  localStorage.setItem(`${schoolId}_my_classes`, JSON.stringify(newClasses))
  localStorage.setItem(`${schoolId}_teachers`, JSON.stringify([newTeacher]))
  localStorage.setItem(`${schoolId}_students_${myClassName}_v2`, JSON.stringify([]))
  localStorage.setItem('currentUser_v3', JSON.stringify(newTeacher))

  return { success: true, user: newTeacher, classes: newClasses }
}