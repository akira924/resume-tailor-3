const FEATURES = [
  {
    title: 'Smart Matching',
    desc: 'AI-powered keyword matching to align your resume with job descriptions.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="m11 8-3 3 3 3" />
        <path d="m13 8 3 3-3 3" />
      </svg>
    ),
  },
  {
    title: 'One Profile',
    desc: 'Enter your details once and generate unlimited tailored resumes.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: 'ATS Friendly',
    desc: 'Optimized formatting that passes applicant tracking systems.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 12 11 14 15 10" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    title: 'Fast Export',
    desc: 'Download polished resumes in PDF format instantly.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </svg>
    ),
  },
]

const STEPS = [
  { num: '1', title: 'Build Your Profile', desc: 'Enter your experience, education, skills, and certifications once.' },
  { num: '2', title: 'Add a Job Description', desc: 'Paste the job posting you want to tailor your resume for.' },
  { num: '3', title: 'Generate & Export', desc: 'Get a targeted resume and download it as a polished PDF.' },
]

const STATS = [
  { value: 'ATS', label: 'Optimized' },
  { value: '1', label: 'Profile needed' },
  { value: 'PDF', label: 'Export ready' },
  { value: '< 1 min', label: 'To generate' },
]

export default function Home({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center px-8 py-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-h)] leading-tight">
              Craft the perfect{' '}
              <span
                style={{
                  backgroundImage: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                resume
              </span>
            </h1>
            <p className="text-lg text-[var(--text)] leading-relaxed max-w-xl">
              Tailor your resume for every opportunity. Fill in your profile once,
              then generate targeted resumes that highlight the skills and experience
              each employer is looking for.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onNavigate?.('profile')}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
                style={{ backgroundImage: 'var(--accent-gradient)' }}
              >
                Get Started
              </button>
              <button
                onClick={() => onNavigate?.('about')}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--text-h)] cursor-pointer hover:bg-[var(--accent-bg)] transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((card) => (
              <div
                key={card.title}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-3 transition-colors hover:border-[var(--accent-border)]"
              >
                <span
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white"
                  style={{ backgroundImage: 'var(--accent-gradient)' }}
                >
                  {card.icon}
                </span>
                <h3 className="text-sm font-semibold text-[var(--text-h)]">{card.title}</h3>
                <p className="text-xs text-[var(--text)] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center space-y-1">
              <p
                className="text-xl font-extrabold"
                style={{
                  backgroundImage: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {s.value}
              </p>
              <p className="text-xs text-[var(--text)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-12 space-y-6">
        <h2 className="text-2xl font-bold text-[var(--text-h)] text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-3 text-center"
            >
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white"
                style={{ backgroundImage: 'var(--accent-gradient)' }}
              >
                {step.num}
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-h)]">{step.title}</h3>
              <p className="text-xs text-[var(--text)] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate?.('profile')}
            className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundImage: 'var(--accent-gradient)' }}
          >
            Start Building Your Resume
          </button>
        </div>
      </div>
    </div>
  )
}
