export interface WorkExperience {
  id: string
  company: string
  jobTitle: string
  period: string
  location: string
  bulletPoints: string
}

export interface Education {
  id: string
  institution: string
  degreeMajor: string
  period: string
}

export interface Certification {
  id: string
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
  jobTitle: string
  workExperiences: WorkExperience[]
  educations: Education[]
  certifications: Certification[]
}

export function uid(): string {
  return crypto.randomUUID()
}

export const emptyWork = (): WorkExperience => ({ id: uid(), company: '', jobTitle: '', period: '', location: '', bulletPoints: '' })
export const emptyEdu = (): Education => ({ id: uid(), institution: '', degreeMajor: '', period: '' })
export const emptyCert = (): Certification => ({ id: uid(), institution: '', certification: '', date: '' })

export function migrateIds<T extends { id?: string }>(items: T[]): (T & { id: string })[] {
  return items.map(item => item.id ? item as T & { id: string } : { ...item, id: uid() })
}

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
  jobTitle: '',
  workExperiences: [emptyWork()],
  educations: [emptyEdu()],
  certifications: [emptyCert()],
}
