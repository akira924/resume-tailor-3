export interface WorkExperience {
  company: string
  jobTitle: string
  period: string
  location: string
  bulletPoints: string
}

export interface Education {
  institution: string
  degreeMajor: string
  period: string
}

export interface Certification {
  institution: string
  certification: string
  date: string
}

export interface ProfileData {
  fullName: string
  email: string
  phone: string
  location: string
  linkedIn: string
  gitHub: string
  website: string
  roleBasedJobTitle: boolean
  seniority: string
  workExperiences: WorkExperience[]
  educations: Education[]
  certifications: Certification[]
}

export const emptyWork: WorkExperience = { company: '', jobTitle: '', period: '', location: '', bulletPoints: '' }
export const emptyEdu: Education = { institution: '', degreeMajor: '', period: '' }
export const emptyCert: Certification = { institution: '', certification: '', date: '' }

export const DEFAULT_PROFILE: ProfileData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedIn: '',
  gitHub: '',
  website: '',
  roleBasedJobTitle: false,
  seniority: '',
  workExperiences: [{ ...emptyWork }],
  educations: [{ ...emptyEdu }],
  certifications: [{ ...emptyCert }],
}
