export default function About() {
  const stack = [
    {
      name: 'React',
      desc: 'Component-based UI library for building interactive interfaces.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="2" />
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </svg>
      ),
    },
    {
      name: 'TypeScript',
      desc: 'Strongly-typed JavaScript for safer, more maintainable code.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M12 8v8" />
          <path d="M9 8h6" />
        </svg>
      ),
    },
    {
      name: 'Vite',
      desc: 'Next-generation build tool for lightning-fast development.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      name: 'Tailwind CSS',
      desc: 'Utility-first CSS framework for rapid UI development.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M6.8 11.4S8.4 5.6 12 5.6c5.4 0 4.2 5.4 7.8 5.4 2.4 0 3.6-1.8 3.6-1.8" />
          <path d="M.6 18.4S2.4 12.6 6 12.6c5.4 0 4.2 5.4 7.8 5.4 2.4 0 3.6-1.8 3.6-1.8" />
        </svg>
      ),
    },
  ]

  const values = [
    {
      title: 'Privacy First',
      desc: 'Your data stays in your browser. Nothing is sent to external servers.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      title: 'Free & Open',
      desc: 'No subscriptions, no hidden fees. Use all features at no cost.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      title: 'Built for Speed',
      desc: 'Generate a tailored resume in seconds, not hours.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ]

  const steps = [
    { num: '01', title: 'Build Your Profile', desc: 'Enter your work experience, education, skills, and certifications.' },
    { num: '02', title: 'Paste a Job Description', desc: 'Provide the job posting you want to apply for.' },
    { num: '03', title: 'Get Your Resume', desc: 'Receive a tailored resume emphasizing relevant qualifications.' },
  ]

  return (
    <div className="flex flex-col min-h-full px-8 py-12 pb-20 gap-12">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-h)]">
          About{' '}
          <span
            style={{
              backgroundImage: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Resume Tailor
          </span>
        </h1>
        <p className="text-[var(--text)] text-lg leading-relaxed">
          Resume Tailor helps job seekers create perfectly targeted resumes.
          Instead of maintaining dozens of resume versions, enter your information
          once and generate a customized resume for each application.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-h)]">Why Resume Tailor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {values.map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-3 transition-colors hover:border-[var(--accent-border)]"
            >
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white"
                style={{ backgroundImage: 'var(--accent-gradient)' }}
              >
                {item.icon}
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-h)]">{item.title}</h3>
              <p className="text-xs text-[var(--text)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-h)]">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((item, i) => (
            <div
              key={item.num}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-3 relative"
            >
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                style={{ backgroundImage: 'var(--accent-gradient)' }}
              >
                {i + 1}
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-h)]">{item.title}</h3>
              <p className="text-xs text-[var(--text)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-h)]">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stack.map((item) => (
            <div
              key={item.name}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-3 transition-colors hover:border-[var(--accent-border)]"
            >
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white"
                style={{ backgroundImage: 'var(--accent-gradient)' }}
              >
                {item.icon}
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-h)]">{item.name}</h3>
              <p className="text-xs text-[var(--text)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
