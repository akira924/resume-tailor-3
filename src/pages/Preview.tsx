import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { type ProfileData, DEFAULT_PROFILE } from '../types/profile'

// ── Types ────────────────────────────────────────────

interface FontProps {
  fontSize: number
  fontColor: string
  bold: boolean
}

interface PrimarySettings {
  fontFamily: string
  fontSize: number
  fontColor: string
  pageMargin: number
}

interface HeaderSettings {
  name: FontProps
  jobTitle: FontProps
  contactFontColor: string
  alignment: 'left' | 'center' | 'hybrid'
  jobTitlePosition: 'below' | 'beside'
}

interface SectionTitleSettings {
  fontSize: number
  fontColor: string
  bold: boolean
  capitalize: boolean
  borderVisible: boolean
  alignment: 'left' | 'center'
}

type ExperienceLayout = 'single-row' | 'company-first' | 'role-first'

interface ResumeSettings {
  primary: PrimarySettings
  header: HeaderSettings
  sectionTitle: SectionTitleSettings
  experienceLayout: ExperienceLayout
}

// ── Constants ────────────────────────────────────────

const GOOGLE_FONTS = ['Roboto', 'Lato', 'Open Sans', 'Merriweather', 'Playfair Display']

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Garamond', label: 'Garamond' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Playfair Display', label: 'Playfair Display' },
]

const DEFAULT_SETTINGS: ResumeSettings = {
  primary: { fontFamily: 'Inter', fontSize: 10, fontColor: '#333333', pageMargin: 0.75 },
  header: {
    name: { fontSize: 24, fontColor: '#111827', bold: true },
    jobTitle: { fontSize: 14, fontColor: '#4b5563', bold: false },
    contactFontColor: '#6b7280',
    alignment: 'left',
    jobTitlePosition: 'below',
  },
  sectionTitle: {
    fontSize: 12, fontColor: '#111827', bold: true,
    capitalize: true, borderVisible: true, alignment: 'left',
  },
  experienceLayout: 'company-first',
}

const SAMPLE = {
  name: 'John Doe',
  jobTitle: 'Senior Software Engineer',
  email: 'john.doe@email.com',
  phone: '(555) 123-4567',
  location: 'New York, NY',
  linkedIn: 'linkedin.com/in/johndoe',
  gitHub: 'github.com/johndoe',
  website: 'johndoe.dev',
  summary:
    'Results-driven Senior Software Engineer with 8+ years of experience designing and implementing scalable web applications. Proven track record of leading cross-functional teams and delivering high-impact solutions that improve user engagement and operational efficiency.',
  experience: [
    {
      company: 'Tech Corp',
      role: 'Senior Software Engineer',
      period: 'Jan 2021 – Present',
      location: 'New York, NY',
      bullets: [
        'Led development of microservices architecture serving 2M+ daily active users, improving system reliability to 99.9%',
        'Mentored team of 5 junior developers, improving code review turnaround time by 40%',
        'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes',
      ],
    },
    {
      company: 'StartupXYZ',
      role: 'Software Engineer',
      period: 'Jun 2018 – Dec 2020',
      location: 'San Francisco, CA',
      bullets: [
        'Built real-time data processing pipeline handling 500K+ events per second using Kafka and Spark',
        'Developed RESTful APIs consumed by 50+ enterprise clients with 99.95% uptime SLA',
        'Reduced application load time by 60% through code splitting and lazy loading optimizations',
      ],
    },
  ],
  education: [
    { institution: 'Massachusetts Institute of Technology', degree: 'B.S. Computer Science', period: '2014 – 2018' },
  ],
  skills: [
    { category: 'Languages', skills: ['JavaScript', 'TypeScript', 'Python', 'Go'] },
    { category: 'Frameworks & Libraries', skills: ['React', 'Node.js', 'GraphQL'] },
    { category: 'Cloud & DevOps', skills: ['AWS', 'Docker', 'Kubernetes'] },
    { category: 'Databases', skills: ['PostgreSQL', 'Redis'] },
  ],
}

const PAGE_W = 816
const PAGE_H = 1056

// ── Resume Data Types & Helpers ─────────────────────

interface ExperienceItem {
  company: string
  role: string
  period: string
  location: string
  bullets: string[]
}

interface EducationItem {
  institution: string
  degree: string
  period: string
}

interface CertificationItem {
  institution: string
  certification: string
  date: string
}

interface SkillCategory {
  category: string
  skills: string[]
}

interface ResumeData {
  name: string
  jobTitle: string
  email: string
  phone: string
  location: string
  linkedIn: string
  gitHub: string
  website: string
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  certifications: CertificationItem[]
  skills: SkillCategory[]
}

const SAMPLE_DATA: ResumeData = { ...SAMPLE, certifications: [] }

function extractJsonString(raw: string): string {
  const match = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  return match ? match[1].trim() : raw.trim()
}

function buildResumeData(profile: ProfileData, jsonStr: string): ResumeData | null {
  if (!jsonStr.trim()) return null

  try {
    const cleaned = extractJsonString(jsonStr)
    const parsed = JSON.parse(cleaned)
    const isRoleBased = profile.roleBasedJobTitle

    const skills: SkillCategory[] = Array.isArray(parsed.skills)
      ? parsed.skills.flatMap((cat: Record<string, string[]>) =>
          Object.entries(cat).map(([category, items]) => ({ category, skills: items }))
        )
      : []

    const experience: ExperienceItem[] = Array.isArray(parsed.experience)
      ? parsed.experience.map((exp: { title?: string; sentences?: string[] }, i: number) => {
          const profileExp = profile.workExperiences[i]
          return {
            company: profileExp?.company || '',
            role: isRoleBased ? (profileExp?.jobTitle || '') : (exp.title || ''),
            period: profileExp?.period || '',
            location: profileExp?.location || '',
            bullets: Array.isArray(exp.sentences) ? exp.sentences : [],
          }
        })
      : []

    const education: EducationItem[] = profile.educations
      .filter(e => e.institution || e.degreeMajor)
      .map(e => ({ institution: e.institution, degree: e.degreeMajor, period: e.period }))

    const certifications: CertificationItem[] = profile.certifications
      .filter(c => c.certification || c.institution)
      .map(c => ({ institution: c.institution, certification: c.certification, date: c.date }))

    return {
      name: profile.fullName,
      jobTitle: isRoleBased ? profile.seniority : (parsed.title || ''),
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      linkedIn: profile.linkedIn,
      gitHub: profile.gitHub,
      website: profile.website,
      summary: parsed.summary || '',
      experience,
      education,
      certifications,
      skills,
    }
  } catch {
    return null
  }
}

// ── Utility Components ───────────────────────────────

function SettingsGroup({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--text-h)] cursor-pointer hover:bg-[var(--accent-bg)] transition-colors"
      >
        {title}
        <span className="text-[10px] text-[var(--text)]">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-[var(--border)]">
          {children}
        </div>
      )}
    </div>
  )
}

function SegmentedControl<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-1.5 text-[11px] font-medium cursor-pointer transition-colors ${
            value === opt.value
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--text)] hover:bg-[var(--accent-bg)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs font-medium text-[var(--text)] whitespace-nowrap">{label}</label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label
      className="relative w-7 h-7 rounded-md border border-[var(--border)] cursor-pointer block overflow-hidden shrink-0"
      style={{ backgroundColor: value }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
      />
    </label>
  )
}

function NumInput({ value, onChange, min, max, step, className = 'w-16' }: {
  value: number; onChange: (v: number) => void
  min?: number; max?: number; step?: number; className?: string
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min} max={max} step={step}
      className={`${className} px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-xs text-right focus:outline-none focus:border-[var(--accent-border)] transition-colors`}
    />
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0"
      style={{ backgroundColor: value ? 'var(--accent)' : 'var(--border)' }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-150"
        style={{ left: value ? 18 : 2 }}
      />
    </button>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-[var(--text-h)] pt-1 pb-0.5 border-l-2 border-[var(--accent)] pl-2 -ml-0.5">
      {children}
    </p>
  )
}

// ── Settings Sections ────────────────────────────────

function PrimarySection({ value, onChange }: {
  value: PrimarySettings; onChange: (v: PrimarySettings) => void
}) {
  const set = <K extends keyof PrimarySettings>(k: K, v: PrimarySettings[K]) =>
    onChange({ ...value, [k]: v })

  return (
    <SettingsGroup title="Primary">
      <FieldRow label="Font Family">
        <select
          value={value.fontFamily}
          onChange={(e) => set('fontFamily', e.target.value)}
          className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-xs focus:outline-none focus:border-[var(--accent-border)] cursor-pointer"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label="Font Size">
        <NumInput value={value.fontSize} onChange={(v) => set('fontSize', v)} min={6} max={16} step={0.5} className="w-14" />
        <span className="text-[10px] text-[var(--text)]">pt</span>
      </FieldRow>
      <FieldRow label="Font Color">
        <span className="text-[10px] text-[var(--text)] font-mono">{value.fontColor}</span>
        <ColorInput value={value.fontColor} onChange={(v) => set('fontColor', v)} />
      </FieldRow>
      <FieldRow label="Page Margin">
        <NumInput value={value.pageMargin} onChange={(v) => set('pageMargin', v)} min={0.25} max={1.5} step={0.125} className="w-14" />
        <span className="text-[10px] text-[var(--text)]">in</span>
      </FieldRow>
    </SettingsGroup>
  )
}

function HeaderSection({ value, onChange }: {
  value: HeaderSettings; onChange: (v: HeaderSettings) => void
}) {
  const setName = <K extends keyof FontProps>(k: K, v: FontProps[K]) =>
    onChange({ ...value, name: { ...value.name, [k]: v } })
  const setTitle = <K extends keyof FontProps>(k: K, v: FontProps[K]) =>
    onChange({ ...value, jobTitle: { ...value.jobTitle, [k]: v } })

  return (
    <SettingsGroup title="Header">
      <SubHeading>Full Name</SubHeading>
      <FieldRow label="Font Size">
        <NumInput value={value.name.fontSize} onChange={(v) => setName('fontSize', v)} min={12} max={48} className="w-14" />
        <span className="text-[10px] text-[var(--text)]">pt</span>
      </FieldRow>
      <FieldRow label="Font Color">
        <span className="text-[10px] text-[var(--text)] font-mono">{value.name.fontColor}</span>
        <ColorInput value={value.name.fontColor} onChange={(v) => setName('fontColor', v)} />
      </FieldRow>
      <FieldRow label="Bold">
        <Toggle value={value.name.bold} onChange={(v) => setName('bold', v)} />
      </FieldRow>

      <SubHeading>Job Title</SubHeading>
      <FieldRow label="Font Size">
        <NumInput value={value.jobTitle.fontSize} onChange={(v) => setTitle('fontSize', v)} min={8} max={36} className="w-14" />
        <span className="text-[10px] text-[var(--text)]">pt</span>
      </FieldRow>
      <FieldRow label="Font Color">
        <span className="text-[10px] text-[var(--text)] font-mono">{value.jobTitle.fontColor}</span>
        <ColorInput value={value.jobTitle.fontColor} onChange={(v) => setTitle('fontColor', v)} />
      </FieldRow>
      <FieldRow label="Bold">
        <Toggle value={value.jobTitle.bold} onChange={(v) => setTitle('bold', v)} />
      </FieldRow>

      <SubHeading>Contact Info</SubHeading>
      <FieldRow label="Font Color">
        <span className="text-[10px] text-[var(--text)] font-mono">{value.contactFontColor}</span>
        <ColorInput value={value.contactFontColor} onChange={(v) => onChange({ ...value, contactFontColor: v })} />
      </FieldRow>

      <SubHeading>Layout</SubHeading>
      <FieldRow label="Alignment">
        <SegmentedControl
          options={[
            { value: 'left' as const, label: 'Left' },
            { value: 'center' as const, label: 'Center' },
            { value: 'hybrid' as const, label: 'Hybrid' },
          ]}
          value={value.alignment}
          onChange={(v) => onChange({ ...value, alignment: v })}
        />
      </FieldRow>
      <FieldRow label="Title Position">
        <SegmentedControl
          options={[
            { value: 'below' as const, label: 'Below Name' },
            { value: 'beside' as const, label: 'Next to Name' },
          ]}
          value={value.jobTitlePosition}
          onChange={(v) => onChange({ ...value, jobTitlePosition: v })}
        />
      </FieldRow>
    </SettingsGroup>
  )
}

function SectionTitleSection({ value, onChange }: {
  value: SectionTitleSettings; onChange: (v: SectionTitleSettings) => void
}) {
  const set = <K extends keyof SectionTitleSettings>(k: K, v: SectionTitleSettings[K]) =>
    onChange({ ...value, [k]: v })

  return (
    <SettingsGroup title="Section Titles">
      <FieldRow label="Font Size">
        <NumInput value={value.fontSize} onChange={(v) => set('fontSize', v)} min={8} max={24} className="w-14" />
        <span className="text-[10px] text-[var(--text)]">pt</span>
      </FieldRow>
      <FieldRow label="Font Color">
        <span className="text-[10px] text-[var(--text)] font-mono">{value.fontColor}</span>
        <ColorInput value={value.fontColor} onChange={(v) => set('fontColor', v)} />
      </FieldRow>
      <FieldRow label="Bold">
        <Toggle value={value.bold} onChange={(v) => set('bold', v)} />
      </FieldRow>
      <FieldRow label="Capitalize">
        <Toggle value={value.capitalize} onChange={(v) => set('capitalize', v)} />
      </FieldRow>
      <FieldRow label="Border">
        <Toggle value={value.borderVisible} onChange={(v) => set('borderVisible', v)} />
      </FieldRow>
      <FieldRow label="Alignment">
        <SegmentedControl
          options={[
            { value: 'left' as const, label: 'Left' },
            { value: 'center' as const, label: 'Center' },
          ]}
          value={value.alignment}
          onChange={(v) => set('alignment', v)}
        />
      </FieldRow>
    </SettingsGroup>
  )
}

function LayoutDiagram({ rows, active }: {
  rows: { left: string; right?: string }[]
  active: boolean
}) {
  return (
    <div className={`space-y-1 p-2 rounded-md ${active ? '' : 'opacity-50'}`}>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <span className="px-1.5 py-0.5 text-[8px] rounded bg-[var(--accent-bg)] text-[var(--accent)] font-medium leading-none">
            {row.left}
          </span>
          {row.right && (
            <span className="px-1.5 py-0.5 text-[8px] rounded bg-[var(--accent-bg)] text-[var(--accent)] font-medium leading-none">
              {row.right}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function ExperienceSection({ value, onChange }: {
  value: ExperienceLayout; onChange: (v: ExperienceLayout) => void
}) {
  const options: { layout: ExperienceLayout; label: string; rows: { left: string; right?: string }[] }[] = [
    {
      layout: 'single-row',
      label: 'Single Row',
      rows: [{ left: 'Company – Role', right: 'Period | Location' }],
    },
    {
      layout: 'company-first',
      label: 'Company First',
      rows: [
        { left: 'Company', right: 'Location' },
        { left: 'Role', right: 'Period' },
      ],
    },
    {
      layout: 'role-first',
      label: 'Role First',
      rows: [
        { left: 'Role', right: 'Period' },
        { left: 'Company', right: 'Location' },
      ],
    },
  ]

  return (
    <SettingsGroup title="Experience">
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.layout}
            onClick={() => onChange(opt.layout)}
            className={`w-full text-left rounded-lg border p-2.5 cursor-pointer transition-colors ${
              value === opt.layout
                ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                : 'border-[var(--border)] hover:border-[var(--accent-border)]'
            }`}
          >
            <span className="text-[11px] font-medium text-[var(--text-h)] block mb-1 px-1">
              {opt.label}
            </span>
            <LayoutDiagram rows={opt.rows} active={value === opt.layout} />
          </button>
        ))}
      </div>
    </SettingsGroup>
  )
}

// ── Resume Preview Components ────────────────────────

function ZoomControls({ zoom, onZoomChange }: { zoom: number; onZoomChange: (z: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onZoomChange(Math.max(25, zoom - 10))}
        className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-h)] text-sm font-bold cursor-pointer hover:bg-[var(--accent-bg)] transition-colors flex items-center justify-center"
      >
        −
      </button>
      <button
        onClick={() => onZoomChange(100)}
        className="min-w-[3.2rem] h-7 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-h)] text-[11px] font-medium cursor-pointer hover:bg-[var(--accent-bg)] transition-colors"
        title="Reset to 100%"
      >
        {zoom}%
      </button>
      <button
        onClick={() => onZoomChange(Math.min(200, zoom + 10))}
        className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-h)] text-sm font-bold cursor-pointer hover:bg-[var(--accent-bg)] transition-colors flex items-center justify-center"
      >
        +
      </button>
    </div>
  )
}

function ResumeHeader({ settings, data }: { settings: ResumeSettings; data: ResumeData }) {
  const { header } = settings
  const nameStyle: React.CSSProperties = {
    fontSize: `${header.name.fontSize}pt`,
    color: header.name.fontColor,
    fontWeight: header.name.bold ? 700 : 400,
    lineHeight: 1.2,
  }
  const titleStyle: React.CSSProperties = {
    fontSize: `${header.jobTitle.fontSize}pt`,
    color: header.jobTitle.fontColor,
    fontWeight: header.jobTitle.bold ? 700 : 400,
    lineHeight: 1.3,
  }
  const contactStyle: React.CSSProperties = {
    color: header.contactFontColor,
    fontSize: `${settings.primary.fontSize}pt`,
    lineHeight: 1.5,
  }

  const useEmbeddedLinks = header.alignment === 'left' || header.alignment === 'center'
  const linkStyle: React.CSSProperties = { color: header.contactFontColor, textDecoration: 'underline' }

  const onlinePresence: { label: string; url: string }[] = [
    ...(data.linkedIn ? [{ label: 'LinkedIn', url: `https://${data.linkedIn}` }] : []),
    ...(data.gitHub ? [{ label: 'GitHub', url: `https://${data.gitHub}` }] : []),
    ...(data.website ? [{ label: 'Website', url: `https://${data.website}` }] : []),
  ]

  const contactInlineItems: React.ReactNode[] = [
    ...(data.email ? [<span key="email">{data.email}</span>] : []),
    ...(data.phone ? [<span key="phone">{data.phone}</span>] : []),
    ...(useEmbeddedLinks
      ? onlinePresence.map((op) => (
          <a key={op.label} href={op.url} style={linkStyle} target="_blank" rel="noreferrer">{op.label}</a>
        ))
      : onlinePresence.map((op) => (
          <span key={op.label}>{op.url.replace('https://', '')}</span>
        ))
    ),
    ...(data.location ? [<span key="location">{data.location}</span>] : []),
  ]

  const contactInline = (
    <>
      {contactInlineItems.map((item, i) => (
        <span key={i}>
          {i > 0 && <span>{' '}|{' '}</span>}
          {item}
        </span>
      ))}
    </>
  )

  const hybridContactItems: React.ReactNode[] = [
    ...(data.email ? [<div key="email">{data.email}</div>] : []),
    ...(data.phone ? [<div key="phone">{data.phone}</div>] : []),
    ...onlinePresence.map((op) => (
      <div key={op.label}>{op.url.replace('https://', '')}</div>
    )),
    ...(data.location ? [<div key="location">{data.location}</div>] : []),
  ]

  const nameAndTitle = header.jobTitlePosition === 'beside' ? (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, justifyContent: header.alignment === 'center' ? 'center' : undefined }}>
      <span style={nameStyle}>{data.name}</span>
      <span style={titleStyle}>{data.jobTitle}</span>
    </div>
  ) : (
    <div>
      <div style={nameStyle}>{data.name}</div>
      <div style={{ ...titleStyle, marginTop: 2 }}>{data.jobTitle}</div>
    </div>
  )

  if (header.alignment === 'center') {
    return (
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        {nameAndTitle}
        <div style={{ ...contactStyle, marginTop: 4 }}>{contactInline}</div>
      </div>
    )
  }

  if (header.alignment === 'hybrid') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>{nameAndTitle}</div>
        <div style={{ ...contactStyle, textAlign: 'right' }}>
          {hybridContactItems}
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {nameAndTitle}
      <div style={{ ...contactStyle, marginTop: 4 }}>{contactInline}</div>
    </div>
  )
}

function ResumeSectionTitle({ settings, children }: { settings: ResumeSettings; children: string }) {
  const { sectionTitle } = settings
  return (
    <div
      style={{
        fontSize: `${sectionTitle.fontSize}pt`,
        color: sectionTitle.fontColor,
        fontWeight: sectionTitle.bold ? 700 : 400,
        textTransform: sectionTitle.capitalize ? 'uppercase' : 'none',
        letterSpacing: sectionTitle.capitalize ? '0.05em' : undefined,
        borderBottom: sectionTitle.borderVisible ? `1.5px solid ${sectionTitle.fontColor}` : 'none',
        paddingBottom: sectionTitle.borderVisible ? 3 : 0,
        marginTop: 14,
        marginBottom: 8,
        textAlign: sectionTitle.alignment,
        lineHeight: 1.3,
      }}
    >
      {children}
    </div>
  )
}

function ExperienceEntry({ settings, entry }: {
  settings: ResumeSettings
  entry: ExperienceItem
}) {
  const baseFontSize = `${settings.primary.fontSize}pt`
  const labelSize = `${settings.primary.fontSize + 1}pt`
  const color = settings.primary.fontColor

  const header = (() => {
    switch (settings.experienceLayout) {
      case 'single-row':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: labelSize, color }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{entry.company}</span>
              <span style={{ fontWeight: 400 }}>–</span>
              <span style={{ fontWeight: 500 }}>{entry.role}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, textAlign: 'right', fontSize: baseFontSize }}>
              <span>{entry.period}</span>
              <span style={{ fontWeight: 400 }}>|</span>
              <span>{entry.location}</span>
            </div>
          </div>
        )
      case 'company-first':
        return (
          <div style={{ fontSize: labelSize, color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>{entry.company}</span>
              <span style={{ fontSize: baseFontSize }}>{entry.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontStyle: 'italic' }}>{entry.role}</span>
              <span style={{ fontSize: baseFontSize }}>{entry.period}</span>
            </div>
          </div>
        )
      case 'role-first':
        return (
          <div style={{ fontSize: labelSize, color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>{entry.role}</span>
              <span style={{ fontSize: baseFontSize }}>{entry.period}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontStyle: 'italic' }}>{entry.company}</span>
              <span style={{ fontSize: baseFontSize }}>{entry.location}</span>
            </div>
          </div>
        )
    }
  })()

  return (
    <div style={{ marginBottom: 10 }}>
      {header}
      <ul style={{ margin: '4px 0 0 0', paddingLeft: 18, listStyleType: 'disc', fontSize: baseFontSize, color, lineHeight: 1.5 }}>
        {entry.bullets.map((b, i) => (
          <li key={i} style={{ marginBottom: 1 }}>{b}</li>
        ))}
      </ul>
    </div>
  )
}

function ResumePreview({ settings, zoom, data }: { settings: ResumeSettings; zoom: number; data: ResumeData }) {
  const scale = zoom / 100
  const margin = settings.primary.pageMargin * 96
  const contentRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    if (contentRef.current) {
      const pages = Math.max(1, Math.ceil(contentRef.current.scrollHeight / PAGE_H))
      if (pages !== pageCount) setPageCount(pages)
    }
  })

  const gap = 32
  const totalHeight = pageCount * PAGE_H + (pageCount - 1) * gap

  const contentStyle: React.CSSProperties = {
    width: PAGE_W,
    padding: margin,
    fontFamily: `"${settings.primary.fontFamily}", sans-serif`,
    fontSize: `${settings.primary.fontSize}pt`,
    color: settings.primary.fontColor,
    boxSizing: 'border-box',
  }

  const resumeContent = (
    <>
      <ResumeHeader settings={settings} data={data} />

      {data.summary && (
        <>
          <ResumeSectionTitle settings={settings}>Professional Summary</ResumeSectionTitle>
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: `${settings.primary.fontSize}pt`, color: settings.primary.fontColor }}>
            {data.summary}
          </p>
        </>
      )}

      {data.skills.length > 0 && (
        <>
          <ResumeSectionTitle settings={settings}>Technical Skills</ResumeSectionTitle>
          <div style={{ margin: 0, lineHeight: 1.6, fontSize: `${settings.primary.fontSize}pt`, color: settings.primary.fontColor }}>
            {data.skills.map((cat, i) => (
              <div key={i} style={{ marginBottom: i < data.skills.length - 1 ? 2 : 0 }}>
                <span style={{ fontWeight: 600 }}>{cat.category}:</span>{' '}
                {cat.skills.join(', ')}
              </div>
            ))}
          </div>
        </>
      )}

      {data.experience.length > 0 && (
        <>
          <ResumeSectionTitle settings={settings}>Experience</ResumeSectionTitle>
          {data.experience.map((exp, i) => (
            <ExperienceEntry key={i} settings={settings} entry={exp} />
          ))}
        </>
      )}

      {data.education.length > 0 && (
        <>
          <ResumeSectionTitle settings={settings}>Education</ResumeSectionTitle>
          {data.education.map((edu, i) => (
            <div key={i} style={{ fontSize: `${settings.primary.fontSize + 1}pt`, color: settings.primary.fontColor }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600 }}>{edu.institution}</span>
                <span style={{ fontSize: `${settings.primary.fontSize}pt` }}>{edu.period}</span>
              </div>
              <div style={{ fontStyle: 'italic', fontSize: `${settings.primary.fontSize}pt` }}>{edu.degree}</div>
            </div>
          ))}
        </>
      )}

      {data.certifications.length > 0 && (
        <>
          <ResumeSectionTitle settings={settings}>Certifications</ResumeSectionTitle>
          {data.certifications.map((cert, i) => (
            <div key={i} style={{ fontSize: `${settings.primary.fontSize + 1}pt`, color: settings.primary.fontColor }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600 }}>{cert.certification}</span>
                <span style={{ fontSize: `${settings.primary.fontSize}pt` }}>{cert.date}</span>
              </div>
              {cert.institution && <div style={{ fontStyle: 'italic', fontSize: `${settings.primary.fontSize}pt` }}>{cert.institution}</div>}
            </div>
          ))}
        </>
      )}
    </>
  )

  return (
    <div style={{ width: PAGE_W * scale, height: totalHeight * scale, flexShrink: 0 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: PAGE_W, position: 'relative' }}>
        <div
          ref={contentRef}
          aria-hidden
          data-no-print
          style={{ ...contentStyle, position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}
        >
          {resumeContent}
        </div>

        {/* Visible pages */}
        {Array.from({ length: pageCount }, (_, i) => (
          <div
            key={i}
            data-resume-page
            style={{
              width: PAGE_W,
              height: PAGE_H,
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '0 2px 24px rgba(0,0,0,0.12)',
              position: 'relative',
              marginBottom: i < pageCount - 1 ? gap : 0,
            }}
          >
            <div style={{ ...contentStyle, position: 'absolute', top: -(i * PAGE_H) }}>
              {resumeContent}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Clipboard Button ────────────────────────────────

function ClipboardButton({ type, onClick, copied }: {
  type: 'copy' | 'paste'; onClick: () => void; copied: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors cursor-pointer"
      title={copied ? (type === 'copy' ? 'Copied!' : 'Pasted!') : type === 'copy' ? 'Copy to clipboard' : 'Paste from clipboard'}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : type === 'copy' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      )}
    </button>
  )
}

// ── Right Sidebar ───────────────────────────────────

function buildAiPrompt(profile: ProfileData): string {
  const workLines = profile.workExperiences
    .filter(w => w.company)
    .map(w => `- ${w.company}, ${w.period || 'N/A'}, ${w.bulletPoints || '0'} Bullet Points`)
    .join('\n')

  const eduLines = profile.educations
    .filter(e => e.degreeMajor)
    .map(e => `- ${e.degreeMajor}`)
    .join('\n')

  const sentenceCountRules = profile.workExperiences
    .filter(w => w.company && w.bulletPoints)
    .map(w => `- ${w.company}: at least ${w.bulletPoints} sentences`)
    .join('\n')

  const candidateLocation = profile.location || 'Austin, TX'

  return `You are a resume generation engine.
Your output MUST be exactly ONE valid JSON object inside a single code block.
Do NOT include explanations, comments, markdown, headers, or text outside the JSON.
Do NOT generate multiple code blocks.
Do NOT ask questions.
If any rule fails, STOP and return a plain text error message instead of JSON.

========================================
CANDIDATE PROFILE
========================================
Seniority Level: ${profile.seniority || 'Not specified'}
Work Experience:
${workLines || '- No work experience provided'}
Education:
${eduLines || '- No education provided'}

========================================
JOB DESCRIPTION HANDLING RULES
========================================
1. If the job requires security clearance, on-site only work, DO NOT generate a resume.
2. If the job requires a specific location and it does NOT match ${candidateLocation}, DO NOT generate a resume.

========================================
OUTPUT FORMAT (STRICT)
========================================
Return ONE JSON object with the following structure:
{
  "title": "",
  "summary": "",
  "skills": [
    { "Category1": ["Skill1", "Skill2", "..."] }
  ],
  "experience": [
    {
      "title": "",
      "sentences": [
        "Sentence 1",
        "Sentence 2"
      ]
    }
  ]
}

========================================
CONTENT RULES
========================================
SUMMARY
- 3–4 sentences
- Professional, ATS-optimized, concise
- Aligned directly to the job description
JOB TITLES IN HEADER AND EACH COMPANY
- 2–4 words
- Common industry titles aligned with the job description
- Follow a logical career progression
SKILLS
- 30–35 total skills
- Categorized
- Must include technologies from the job description
- Only include technologies released before the experience period
EDUCATION DEGREE RULES:
Only modify the degree if it is not related to the job description.
- Each degree should be appropriate for the job description.
- Each degree should be common in the industry.
EXPERIENCE – SENTENCE RULES (VERY IMPORTANT)
- Third-person only without the name, and he or she
- No bullet symbols
- Each sentence must be 150–250 characters and contain detailed, technically rich descriptions of your role, specific contributions, and technologies used.
- Each sentence must end with a period
- No sentence may be vague or generic
- Each experience must reference company industry relevance
SENTENCE COUNT PER COMPANY
${sentenceCountRules || '- No sentence count rules specified'}
Each sentence must be placed as a separate string inside the sentences array.

========================================
FORMATTING RULES
========================================
- JSON ONLY
- ONE code block ONLY
- No markdown outside JSON
- No comments
- No trailing commas
- Valid JSON syntax
- ATS-safe language only

========================================
FINAL VALIDATION
========================================
Before responding, verify:
- All job description technologies are included
- Sentence length requirements are met
- Sentence count requirements are met
- Job titles are aligned to the role
- Output is valid JSON

========================================
JOB DESCRIPTION
========================================
`
}

function buildRoleBasedAiPrompt(profile: ProfileData): string {
  const workLines = profile.workExperiences
    .filter(w => w.company)
    .map(w => `- ${w.company}, ${w.jobTitle || 'N/A'}, ${w.period || 'N/A'}, ${w.bulletPoints || '0'} Bullet Points`)
    .join('\n')

  const eduLines = profile.educations
    .filter(e => e.degreeMajor)
    .map(e => `- ${e.degreeMajor}`)
    .join('\n')

  const sentenceCountRules = profile.workExperiences
    .filter(w => w.company && w.bulletPoints)
    .map(w => `- ${w.company}: at least ${w.bulletPoints} sentences`)
    .join('\n')

  const candidateLocation = profile.location || 'Austin, TX'

  return `You are a resume generation engine.
Your output MUST be exactly ONE valid JSON object inside a single code block.
Do NOT include explanations, comments, markdown, headers, or text outside the JSON.
Do NOT generate multiple code blocks.
Do NOT ask questions.
If any rule fails, STOP and return a plain text error message instead of JSON.

========================================
CANDIDATE PROFILE
========================================
Job Title: ${profile.seniority || 'Not specified'}
Work Experience:
${workLines || '- No work experience provided'}
Education:
${eduLines || '- No education provided'}

========================================
JOB DESCRIPTION HANDLING RULES
========================================
1. If the job requires security clearance, on-site only work, DO NOT generate a resume.
2. If the job requires a specific location and it does NOT match ${candidateLocation}, DO NOT generate a resume.

========================================
OUTPUT FORMAT (STRICT)
========================================
Return ONE JSON object with the following structure:
{
  "summary": "",
  "skills": [
    { "Category1": ["Skill1", "Skill2", "..."] }
  ],
  "experience": [
    {
      "sentences": [
        "Sentence 1",
        "Sentence 2"
      ]
    }
  ]
}

========================================
CONTENT RULES
========================================
SUMMARY
- 3–4 sentences
- Professional, ATS-optimized, concise
- Aligned directly to the job description
SKILLS
- 30–35 total skills
- Categorized
- Must include technologies from the job description
- Only include technologies released before the experience period
EDUCATION DEGREE RULES:
Only modify the degree if it is not related to the job description.
- Each degree should be appropriate for the job description.
- Each degree should be common in the industry.
EXPERIENCE – SENTENCE RULES (VERY IMPORTANT)
- Third-person only without the name, and he or she
- No bullet symbols
- Each sentence must be 150–250 characters and contain detailed, technically rich descriptions of your role, specific contributions, and technologies used.
- Each sentence must end with a period
- No sentence may be vague or generic
- Each experience must reference company industry relevance
SENTENCE COUNT PER COMPANY
${sentenceCountRules || '- No sentence count rules specified'}
Each sentence must be placed as a separate string inside the sentences array.

========================================
FORMATTING RULES
========================================
- JSON ONLY
- ONE code block ONLY
- No markdown outside JSON
- No comments
- No trailing commas
- Valid JSON syntax
- ATS-safe language only

========================================
FINAL VALIDATION
========================================
Before responding, verify:
- All job description technologies are included
- Sentence length requirements are met
- Sentence count requirements are met
- Job titles are aligned to the role
- Output is valid JSON

========================================
JOB DESCRIPTION
========================================
`
}

function RightSidebar({ jsonInput, onJsonChange, aiPrompt }: {
  jsonInput: string; onJsonChange: (v: string) => void; aiPrompt: string
}) {
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [pastedJson, setPastedJson] = useState(false)

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch { /* clipboard not available */ }
  }

  const handlePasteJson = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onJsonChange(text)
      setPastedJson(true)
      setTimeout(() => setPastedJson(false), 2000)
    } catch { /* clipboard not available */ }
  }

  return (
    <div className="w-96 shrink-0 border-l border-[var(--border)] overflow-y-auto" data-no-print>
      <div className="p-5 space-y-4">
        <h1 className="text-xl font-bold text-[var(--text-h)] tracking-tight">AI Assistant</h1>

        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold text-[var(--text-h)]">AI Prompt</span>
            <div className="mr-1">
              <ClipboardButton type="copy" onClick={handleCopyPrompt} copied={copiedPrompt} />
            </div>
          </div>
          <div className="px-4 pb-4 border-t border-[var(--border)]">
            <textarea
              readOnly
              value={aiPrompt}
              className="w-full h-64 mt-3 px-3 py-2.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-xs leading-relaxed resize-none focus:outline-none font-mono cursor-default"
            />
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold text-[var(--text-h)]">JSON Response</span>
            <div className="mr-1">
              <ClipboardButton type="paste" onClick={handlePasteJson} copied={pastedJson} />
            </div>
          </div>
          <div className="px-4 pb-4 border-t border-[var(--border)]">
            <textarea
              value={jsonInput}
              onChange={(e) => onJsonChange(e.target.value)}
              placeholder={'{\n  "title": "Software Engineer",\n  "summary": "...",\n  "skills": [{ "Category": ["Skill1"] }],\n  "experience": [{ "title": "...", "sentences": ["..."] }]\n}'}
              className="w-full h-64 mt-3 px-3 py-2.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-xs leading-relaxed resize-none focus:outline-none focus:border-[var(--accent-border)] transition-colors font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────

export default function Preview() {
  const [settings, setSettings] = useLocalStorage<ResumeSettings>('resume-tailor:settings', DEFAULT_SETTINGS)
  const [profile] = useLocalStorage<ProfileData>('resume-tailor:profile', DEFAULT_PROFILE)
  const [zoom, setZoom] = useState(80)
  const [jsonInput, setJsonInput] = useState('')

  const aiPrompt = useMemo(() => {
    if (profile.roleBasedJobTitle) return buildRoleBasedAiPrompt(profile)
    return buildAiPrompt(profile)
  }, [profile])

  const resumeData = useMemo<ResumeData>(() => {
    return buildResumeData(profile, jsonInput) || SAMPLE_DATA
  }, [profile, jsonInput])

  useEffect(() => {
    if (GOOGLE_FONTS.includes(settings.primary.fontFamily)) {
      const id = 'resume-preview-font'
      let link = document.getElementById(id) as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.id = id
        link.rel = 'stylesheet'
        document.head.appendChild(link)
      }
      const family = settings.primary.fontFamily.replace(/ /g, '+')
      link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;500;600;700&display=swap`
    }
  }, [settings.primary.fontFamily])

  return (
    <div className="flex h-full min-h-0">
      <div className="w-96 shrink-0 border-r border-[var(--border)] overflow-y-auto" data-no-print>
        <div className="p-5 space-y-4">
          <h1 className="text-xl font-bold text-[var(--text-h)] tracking-tight">Customize Resume</h1>
          <PrimarySection value={settings.primary} onChange={(v) => setSettings((s) => ({ ...s, primary: v }))} />
          <HeaderSection value={settings.header} onChange={(v) => setSettings((s) => ({ ...s, header: v }))} />
          <SectionTitleSection value={settings.sectionTitle} onChange={(v) => setSettings((s) => ({ ...s, sectionTitle: v }))} />
          <ExperienceSection value={settings.experienceLayout} onChange={(v) => setSettings((s) => ({ ...s, experienceLayout: v }))} />
        </div>
      </div>

      <div
        className="flex-1 min-w-0 overflow-auto flex flex-col items-center"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <div className="sticky top-0 z-10 w-full flex justify-center py-3 backdrop-blur-sm" data-no-print style={{ backgroundColor: 'color-mix(in srgb, var(--border) 80%, transparent)' }}>
          <div className="flex items-center gap-3">
            <ZoomControls zoom={zoom} onZoomChange={setZoom} />
            <div className="w-px h-5 bg-[var(--border)]" />
            <button
              onClick={() => window.print()}
              className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-h)] cursor-pointer hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors flex items-center justify-center"
              title="Download PDF"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>
        <div className="pb-8">
          <ResumePreview settings={settings} zoom={zoom} data={resumeData} />
        </div>
      </div>

      <RightSidebar jsonInput={jsonInput} onJsonChange={setJsonInput} aiPrompt={aiPrompt} />
    </div>
  )
}
