import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { type ProfileData, DEFAULT_PROFILE } from '../types/profile'
import { generateResumePdf, generateResumePdfBlobUrl } from '../utils/generatePdf'
import type {
  FontProps,
  PrimarySettings,
  PageLayoutSettings,
  HeaderSettings,
  SectionTitleSettings,
  ExperienceLayout,
  ResumeSettings,
} from '../types/settings'

// ── Constants ────────────────────────────────────────

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
  primary: { fontFamily: 'Inter', fontSize: 10, fontColor: '#333333' },
  pageLayout: { pageMargin: 0.75, lineSpacing: 1.2, sectionGap: 12 },
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
      onChange={(e) => {
        const n = Number(e.target.value)
        if (!Number.isNaN(n)) onChange(n)
      }}
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
    </SettingsGroup>
  )
}

function PageLayoutSection({ value, onChange }: {
  value: PageLayoutSettings; onChange: (v: PageLayoutSettings) => void
}) {
  const set = <K extends keyof PageLayoutSettings>(k: K, v: PageLayoutSettings[K]) =>
    onChange({ ...value, [k]: v })

  return (
    <SettingsGroup title="Page Layout">
      <FieldRow label="Page Margin">
        <NumInput value={value.pageMargin} onChange={(v) => set('pageMargin', v)} min={0.25} max={1.5} step={0.125} className="w-14" />
        <span className="text-[10px] text-[var(--text)]">in</span>
      </FieldRow>
      <FieldRow label="Line Spacing">
        <NumInput value={value.lineSpacing} onChange={(v) => set('lineSpacing', v)} min={1} max={2.5} step={0.05} className="w-14" />
      </FieldRow>
      <FieldRow label="Section Gap">
        <NumInput value={value.sectionGap} onChange={(v) => set('sectionGap', v)} min={0} max={32} step={1} className="w-14" />
        <span className="text-[10px] text-[var(--text)]">pt</span>
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
      {rows.map((row) => (
        <div key={row.left} className="flex items-center justify-between gap-2">
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

function RightSidebar({ jsonInput, onJsonChange, aiPrompt, jsonError }: {
  jsonInput: string; onJsonChange: (v: string) => void; aiPrompt: string; jsonError: string | null
}) {
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [pastedJson, setPastedJson] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const pasteTimer = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
      if (pasteTimer.current) clearTimeout(pasteTimer.current)
    }
  }, [])

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt)
      setCopiedPrompt(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedPrompt(false), 2000)
    } catch { /* clipboard not available */ }
  }

  const handlePasteJson = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onJsonChange(text)
      setPastedJson(true)
      if (pasteTimer.current) clearTimeout(pasteTimer.current)
      pasteTimer.current = setTimeout(() => setPastedJson(false), 2000)
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
              className={`w-full h-64 mt-3 px-3 py-2.5 rounded-md border bg-[var(--bg)] text-[var(--text-h)] text-xs leading-relaxed resize-none focus:outline-none transition-colors font-mono ${
                jsonError && jsonInput.trim()
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-[var(--border)] focus:border-[var(--accent-border)]'
              }`}
            />
            {jsonError && (
              <p className="mt-1.5 text-[11px] text-red-500">{jsonError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────

export default function Preview() {
  const [rawSettings, setSettings] = useLocalStorage<ResumeSettings>('resume-tailor:settings', DEFAULT_SETTINGS)
  const settings = useMemo<ResumeSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...rawSettings,
    primary: { ...DEFAULT_SETTINGS.primary, ...rawSettings.primary },
    pageLayout: {
      ...DEFAULT_SETTINGS.pageLayout,
      ...rawSettings.pageLayout,
    },
    header: {
      ...DEFAULT_SETTINGS.header,
      ...rawSettings.header,
      name: { ...DEFAULT_SETTINGS.header.name, ...rawSettings.header?.name },
      jobTitle: { ...DEFAULT_SETTINGS.header.jobTitle, ...rawSettings.header?.jobTitle },
    },
    sectionTitle: { ...DEFAULT_SETTINGS.sectionTitle, ...rawSettings.sectionTitle },
  }), [rawSettings])
  const [profile] = useLocalStorage<ProfileData>('resume-tailor:profile', DEFAULT_PROFILE)
  const [jsonInput, setJsonInput] = useState('')

  const aiPrompt = useMemo(() => {
    if (profile.roleBasedJobTitle) return buildRoleBasedAiPrompt(profile)
    return buildAiPrompt(profile)
  }, [profile])

  const jsonParsed = useMemo(() => buildResumeData(profile, jsonInput), [profile, jsonInput])

  const jsonError = useMemo(() => {
    if (!jsonInput.trim()) return 'Paste a JSON response to preview your resume'
    if (!jsonParsed) return 'Invalid JSON — unable to parse response'
    return null
  }, [jsonInput, jsonParsed])

  const resumeData = jsonParsed || SAMPLE_DATA

  const pdfUrl = useMemo(() => {
    if (!jsonParsed) return null
    try {
      return generateResumePdfBlobUrl(resumeData, settings)
    } catch {
      return null
    }
  }, [jsonParsed, resumeData, settings])

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  const handleDownloadPdf = useCallback(() => {
    try {
      generateResumePdf(resumeData, settings)
    } catch {
      /* PDF generation failed — settings or data may be invalid */
    }
  }, [resumeData, settings])

  return (
    <div className="flex h-full min-h-0">
      <div className="w-96 shrink-0 border-r border-[var(--border)] overflow-y-auto" data-no-print>
        <div className="p-5 space-y-4">
          <h1 className="text-xl font-bold text-[var(--text-h)] tracking-tight">Customize Resume</h1>
          <PrimarySection value={settings.primary} onChange={(v) => setSettings((s) => ({ ...s, primary: v }))} />
          <PageLayoutSection value={settings.pageLayout} onChange={(v) => setSettings((s) => ({ ...s, pageLayout: v }))} />
          <HeaderSection value={settings.header} onChange={(v) => setSettings((s) => ({ ...s, header: v }))} />
          <SectionTitleSection value={settings.sectionTitle} onChange={(v) => setSettings((s) => ({ ...s, sectionTitle: v }))} />
          <ExperienceSection value={settings.experienceLayout} onChange={(v) => setSettings((s) => ({ ...s, experienceLayout: v }))} />
        </div>
      </div>

      <div
        className="flex-1 min-w-0 flex flex-col"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <div className="shrink-0 z-10 w-full flex justify-center py-3 backdrop-blur-sm" data-no-print style={{ backgroundColor: 'color-mix(in srgb, var(--border) 80%, transparent)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={!!jsonError}
              className={`h-7 px-3 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-xs font-medium transition-colors flex items-center gap-1.5 ${
                jsonError
                  ? 'text-[var(--text)] opacity-40 cursor-not-allowed'
                  : 'text-[var(--text-h)] cursor-pointer hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'
              }`}
              title={jsonError ? 'Valid JSON response required' : 'Download PDF'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="flex-1 w-full border-0"
            title="Resume PDF Preview"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-8">
              <svg className="mx-auto mb-4 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p className="text-sm font-medium opacity-50">{jsonError || 'Generating PDF Preview…'}</p>
            </div>
          </div>
        )}
      </div>

      <RightSidebar jsonInput={jsonInput} onJsonChange={setJsonInput} aiPrompt={aiPrompt} jsonError={jsonError} />
    </div>
  )
}
