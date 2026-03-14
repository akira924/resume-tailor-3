export default function Contact() {
  const inputClass =
    'w-full px-4 py-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent-border)] focus:ring-1 focus:ring-[var(--accent-border)] transition-colors'

  return (
    <div className="flex flex-col h-full px-8 py-12 gap-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-h)]">
          Get in{' '}
          <span
            style={{
              backgroundImage: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Touch
          </span>
        </h1>
        <p className="text-[var(--text)] text-lg leading-relaxed max-w-2xl">
          Have questions, feedback, or feature requests? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-5">
          <h2 className="text-lg font-bold text-[var(--text-h)]">Send a Message</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Name</label>
              <input type="text" className={inputClass} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Email</label>
              <input type="email" className={inputClass} placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Subject</label>
            <input type="text" className={inputClass} placeholder="What is this about?" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Message</label>
            <textarea
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="Tell us what's on your mind..."
            />
          </div>
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundImage: 'var(--accent-gradient)' }}
          >
            Send Message
          </button>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Email', value: 'hello@resumetailor.app', icon: 'M' },
            { label: 'Response Time', value: 'Within 24 hours', icon: 'T' },
            { label: 'Location', value: 'Remote — Worldwide', icon: 'L' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex items-start gap-4"
            >
              <span
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundImage: 'var(--accent-gradient)' }}
              >
                {item.icon}
              </span>
              <div>
                <p className="text-xs font-medium text-[var(--text)]">{item.label}</p>
                <p className="text-sm font-semibold text-[var(--text-h)]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
