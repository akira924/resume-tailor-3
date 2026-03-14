import { useState } from 'react'
import Home from './pages/Home'
import Profile from './pages/Profile'
import About from './pages/About'
import Contact from './pages/Contact'

type Page = 'home' | 'profile' | 'about' | 'contact'

const pages: Record<Page, { label: string; component: React.FC }> = {
  home: { label: 'Home', component: Home },
  profile: { label: 'Profile', component: Profile },
  about: { label: 'About', component: About },
  contact: { label: 'Contact', component: Contact },
}

function App() {
  const [activePage, setActivePage] = useState<Page>('home')
  const ActiveComponent = pages[activePage].component

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--nav-bg)]">
        <nav className="flex items-center justify-between px-8 py-3">
          <div
            className="text-lg font-bold tracking-tight cursor-pointer text-[var(--text-h)]"
            onClick={() => setActivePage('home')}
          >
            Resume Tailor
          </div>
          <div className="flex items-center gap-1">
            {(Object.keys(pages) as Page[]).map((key) => (
              <button
                key={key}
                onClick={() => setActivePage(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activePage === key
                    ? 'text-white'
                    : 'text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'
                }`}
                style={activePage === key ? { backgroundImage: 'var(--accent-gradient)' } : undefined}
              >
                {pages[key].label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 min-h-0 overflow-auto">
        <ActiveComponent />
      </main>

      <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--footer-bg)] px-8 py-3 flex items-center justify-between text-xs text-[var(--text)]">
        <span>&copy; {new Date().getFullYear()} Resume Tailor</span>
        <span>Built with React &amp; Tailwind CSS</span>
      </footer>
    </div>
  )
}

export default App
