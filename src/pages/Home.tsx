export default function Home() {
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
              <span
                className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-default"
                style={{ backgroundImage: 'var(--accent-gradient)' }}
              >
                Get Started
              </span>
              <span className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--text-h)] cursor-default hover:bg-[var(--accent-bg)] transition-colors">
                Learn More
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Smart Matching', desc: 'AI-powered keyword matching to align your resume with job descriptions.' },
              { title: 'One Profile', desc: 'Enter your details once and generate unlimited tailored resumes.' },
              { title: 'ATS Friendly', desc: 'Optimized formatting that passes applicant tracking systems.' },
              { title: 'Fast Export', desc: 'Download polished resumes in PDF or DOCX format instantly.' },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-2 transition-colors hover:border-[var(--accent-border)]"
              >
                <h3 className="text-sm font-semibold text-[var(--text-h)]">{card.title}</h3>
                <p className="text-xs text-[var(--text)] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
