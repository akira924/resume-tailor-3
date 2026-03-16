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

  const contactInfo = [
    {
      label: 'Email',
      value: 'hello@resumetailor.app',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
    {
      label: 'Response Time',
      value: 'Within 24 hours',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: 'Location',
      value: 'Remote — Worldwide',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ]

  const faq = [
    { q: 'Is Resume Tailor free to use?', a: 'Yes. All features are completely free with no hidden fees or subscriptions.' },
    { q: 'Is my data stored anywhere?', a: 'No. Everything stays in your browser. We don\'t send or store your data on any server.' },
    { q: 'Can I export my resume as PDF?', a: 'Absolutely. You can download a polished, ATS-friendly PDF with one click.' },
    { q: 'How does the tailoring work?', a: 'You enter your full profile once, then paste a job description. The app highlights and prioritizes the experience and skills most relevant to that role.' },
  ]

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="flex flex-col h-full px-8 py-12 gap-10">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
          {contactInfo.map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex items-start gap-4 transition-colors hover:border-[var(--accent-border)]"
            >
              <span
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white"
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

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-h)]">Frequently Asked Questions</h2>
        <div className="space-y-2 max-w-3xl">
          {faq.map((item, i) => (
            <div
              key={i}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden transition-colors hover:border-[var(--accent-border)]"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-[var(--text-h)]">{item.q}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-4 h-4 text-[var(--text)] shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-[var(--text)] leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
