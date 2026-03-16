import { useState } from 'react'

export default function Contact() {
  const inputClass =
    'w-full px-4 py-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent-border)] focus:ring-1 focus:ring-[var(--accent-border)] transition-colors'

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

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
          Have questions, feedback, or feature requests? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <form onSubmit={handleSubmit} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-5">
          <h2 className="text-lg font-bold text-[var(--text-h)]">Send a Message</h2>

          {submitted && (
            <div className="px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 text-sm font-medium">
              Thanks for your message! We&apos;ll get back to you soon.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Name</label>
              <input type="text" className={inputClass} placeholder="Your name" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Email</label>
              <input type="email" className={inputClass} placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Subject</label>
            <input type="text" className={inputClass} placeholder="What is this about?" value={form.subject} onChange={set('subject')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Message</label>
            <textarea
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="Tell us what's on your mind..."
              value={form.message}
              onChange={set('message')}
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity ${canSubmit ? 'cursor-pointer hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}
            style={{ backgroundImage: 'var(--accent-gradient)' }}
          >
            Send Message
          </button>
        </form>

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
