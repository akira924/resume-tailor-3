export interface FontProps {
  fontSize: number
  fontColor: string
  bold: boolean
}

export interface PrimarySettings {
  fontFamily: string
  fontSize: number
  fontColor: string
  pageMargin: number
}

export interface HeaderSettings {
  name: FontProps
  jobTitle: FontProps
  contactFontColor: string
  alignment: 'left' | 'center' | 'hybrid'
  jobTitlePosition: 'below' | 'beside'
}

export interface SectionTitleSettings {
  fontSize: number
  fontColor: string
  bold: boolean
  capitalize: boolean
  borderVisible: boolean
  alignment: 'left' | 'center'
}

export type ExperienceLayout = 'single-row' | 'company-first' | 'role-first'

export interface ResumeSettings {
  primary: PrimarySettings
  header: HeaderSettings
  sectionTitle: SectionTitleSettings
  experienceLayout: ExperienceLayout
}
