export default function About() {
  const stack = [
    { name: 'React', desc: 'Component-based UI library for building interactive interfaces.' },
    { name: 'TypeScript', desc: 'Strongly-typed JavaScript for safer, more maintainable code.' },
    { name: 'Vite', desc: 'Next-generation build tool for lightning-fast development.' },
    { name: 'Tailwind CSS', desc: 'Utility-first CSS framework for rapid UI development.' },
  ]

  return (
    <div className="flex flex-col h-full px-8 py-12 gap-12">
      <div className="space-y-4">
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
        <p className="text-[var(--text)] text-lg leading-relaxed max-w-3xl">
          Resume Tailor helps job seekers create perfectly targeted resumes.
          Instead of maintaining dozens of resume versions, enter your information
          once and generate a customized resume for each application.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-h)]">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stack.map((item) => (
            <div
              key={item.name}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-2 transition-colors hover:border-[var(--accent-border)]"
            >
              <h3 className="text-sm font-semibold text-[var(--text-h)]">{item.name}</h3>
              <p className="text-xs text-[var(--text)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-h)]">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Build Your Profile', desc: 'Enter your work experience, education, skills, and certifications.' },
            { step: '02', title: 'Paste a Job Description', desc: 'Provide the job posting you want to apply for.' },
            { step: '03', title: 'Get Your Resume', desc: 'Receive a tailored resume emphasizing relevant qualifications.' },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-2"
            >
              <span
                className="text-xs font-bold"
                style={{
                  backgroundImage: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Step {item.step}
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-h)]">{item.title}</h3>
              <p className="text-xs text-[var(--text)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
