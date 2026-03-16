import { useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  type WorkExperience,
  type Education,
  type Certification,
  type ProfileData,
  emptyWork,
  emptyEdu,
  emptyCert,
  migrateIds,
  DEFAULT_PROFILE,
} from '../types/profile'

const inputClass =
  'w-full px-3 py-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent-border)] focus:ring-1 focus:ring-[var(--accent-border)] transition-colors'

const labelClass = 'block text-xs font-medium text-[var(--text)] mb-1'

function SectionHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-4">
      <h2 className="text-lg font-semibold text-[var(--text-h)]">
        {children}
      </h2>
      {action}
    </div>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-600 hover:opacity-90 transition-colors cursor-pointer p-0 border-0 bg-transparent text-sm leading-none"
      title="Remove"
    >
      ✕
    </button>
  )
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 rounded-[var(--radius)] border border-dashed border-[var(--accent-border)] text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent-bg)] transition-colors cursor-pointer"
    >
      {children}
    </button>
  )
}

export default function Profile() {
  const [profile, setProfile] = useLocalStorage<ProfileData>('resume-tailor:profile', DEFAULT_PROFILE)
  const migrated = useRef(false)

  useEffect(() => {
    if (migrated.current) return
    migrated.current = true
    const needsMigration =
      profile.workExperiences.some(w => !w.id) ||
      profile.educations.some(e => !e.id) ||
      profile.certifications.some(c => !c.id)
    if (needsMigration) {
      setProfile(prev => ({
        ...prev,
        workExperiences: migrateIds(prev.workExperiences),
        educations: migrateIds(prev.educations),
        certifications: migrateIds(prev.certifications),
      }))
    }
  }, [profile, setProfile])

  const { fullName, email, phone, location, linkedIn, gitHub, website, roleBasedJobTitle, seniority, jobTitle, workExperiences, educations, certifications } = profile

  const set = <K extends keyof ProfileData>(key: K, val: ProfileData[K]) =>
    setProfile(prev => ({ ...prev, [key]: val }))

  function updateWork(index: number, field: keyof WorkExperience, value: string) {
    set('workExperiences', workExperiences.map((w, i) => (i === index ? { ...w, [field]: value } : w)))
  }

  function updateEdu(index: number, field: keyof Education, value: string) {
    set('educations', educations.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  function updateCert(index: number, field: keyof Certification, value: string) {
    set('certifications', certifications.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  return (
    <div className="px-8 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-[var(--text-h)] tracking-tight">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
        <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <SectionHeading>Personal Information</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" className={inputClass} placeholder="John Doe" value={fullName} onChange={e => set('fullName', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="text" className={inputClass} placeholder="john@example.com" value={email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="text" className={inputClass} placeholder="+1 (555) 123-4567" value={phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" className={inputClass} placeholder="New York, NY" value={location} onChange={e => set('location', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <SectionHeading>Online Presence</SectionHeading>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input type="text" className={inputClass} placeholder="linkedin.com/in/johndoe" value={linkedIn} onChange={e => set('linkedIn', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>GitHub</label>
              <input type="text" className={inputClass} placeholder="github.com/johndoe" value={gitHub} onChange={e => set('gitHub', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="text" className={inputClass} placeholder="johndoe.dev" value={website} onChange={e => set('website', e.target.value)} />
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <SectionHeading action={
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <span className="text-xs text-[var(--text)]">Role-based</span>
              <button
                type="button"
                onClick={() => set('roleBasedJobTitle', !roleBasedJobTitle)}
                className="relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0"
                style={{ backgroundColor: roleBasedJobTitle ? 'var(--accent)' : 'var(--border)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-150"
                  style={{ left: roleBasedJobTitle ? 18 : 2 }}
                />
              </button>
            </label>
            <AddButton onClick={() => set('workExperiences', [...workExperiences, emptyWork()])}>+ Add</AddButton>
          </div>
        }>Work Experience</SectionHeading>
        {!roleBasedJobTitle && (
          <div className="mb-4">
            <label className={labelClass}>Seniority Level</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Senior level with over 11 years of experience"
              value={seniority}
              onChange={e => set('seniority', e.target.value)}
            />
          </div>
        )}
        {roleBasedJobTitle && (
          <div className="mb-4">
            <label className={labelClass}>Job Title</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Senior Software Engineer"
              value={jobTitle}
              onChange={e => set('jobTitle', e.target.value)}
            />
          </div>
        )}
        <div className="space-y-4">
          {workExperiences.map((work, i) => (
            <div key={work.id} className="relative rounded-lg border border-[var(--border)] p-4">
              {workExperiences.length > 1 && <RemoveButton onClick={() => set('workExperiences', workExperiences.filter((_, j) => j !== i))} />}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${roleBasedJobTitle ? 'lg:grid-cols-[3fr_3fr_2fr_2fr_1fr]' : 'lg:grid-cols-[3fr_2fr_2fr_1fr]'}`}>
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input type="text" className={inputClass} placeholder="Acme Corp" value={work.company} onChange={e => updateWork(i, 'company', e.target.value)} />
                </div>
                {roleBasedJobTitle && (
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input type="text" className={inputClass} placeholder="Software Engineer" value={work.jobTitle} onChange={e => updateWork(i, 'jobTitle', e.target.value)} />
                  </div>
                )}
                <div>
                  <label className={labelClass}>Period</label>
                  <input type="text" className={inputClass} placeholder="Jan 2022 – Present" value={work.period} onChange={e => updateWork(i, 'period', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" className={inputClass} placeholder="San Francisco, CA" value={work.location} onChange={e => updateWork(i, 'location', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Bullet Points</label>
                  <input type="text" className={inputClass} placeholder="3" value={work.bulletPoints} onChange={e => updateWork(i, 'bulletPoints', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <SectionHeading action={<AddButton onClick={() => set('educations', [...educations, emptyEdu()])}>+ Add</AddButton>}>Education</SectionHeading>
        <div className="space-y-4">
          {educations.map((edu, i) => (
            <div key={edu.id} className="relative rounded-lg border border-[var(--border)] p-4">
              {educations.length > 1 && <RemoveButton onClick={() => set('educations', educations.filter((_, j) => j !== i))} />}
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr] gap-3">
                <div>
                  <label className={labelClass}>Institution</label>
                  <input type="text" className={inputClass} placeholder="MIT" value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Degree and Major</label>
                  <input type="text" className={inputClass} placeholder="B.S. Computer Science" value={edu.degreeMajor} onChange={e => updateEdu(i, 'degreeMajor', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Period</label>
                  <input type="text" className={inputClass} placeholder="Sep 2018 – May 2022" value={edu.period} onChange={e => updateEdu(i, 'period', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <SectionHeading action={<AddButton onClick={() => set('certifications', [...certifications, emptyCert()])}>+ Add</AddButton>}>Certifications</SectionHeading>
        <div className="space-y-4">
          {certifications.map((cert, i) => (
            <div key={cert.id} className="relative rounded-lg border border-[var(--border)] p-4">
              {certifications.length > 1 && <RemoveButton onClick={() => set('certifications', certifications.filter((_, j) => j !== i))} />}
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr] gap-3">
                <div>
                  <label className={labelClass}>Institution</label>
                  <input type="text" className={inputClass} placeholder="AWS" value={cert.institution} onChange={e => updateCert(i, 'institution', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Certification</label>
                  <input type="text" className={inputClass} placeholder="Solutions Architect" value={cert.certification} onChange={e => updateCert(i, 'certification', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Date</label>
                  <input type="text" className={inputClass} placeholder="Mar 2024" value={cert.date} onChange={e => updateCert(i, 'date', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
