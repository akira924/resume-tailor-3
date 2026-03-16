import { useState, useCallback } from 'react'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Preview from './pages/Preview'
import About from './pages/About'
import Contact from './pages/Contact'

type Page = 'home' | 'profile' | 'preview' | 'about' | 'contact'

const PAGE_LABELS: Record<Page, string> = {
  home: 'Home',
  profile: 'Profile',
  preview: 'Preview',
  about: 'About',
  contact: 'Contact',
}

const PAGE_KEYS = Object.keys(PAGE_LABELS) as Page[]

function App() {
  const [activePage, setActivePage] = useState<Page>('home')

  const navigate = useCallback((page: string) => {
    if (page in PAGE_LABELS) setActivePage(page as Page)
  }, [])

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
            {PAGE_KEYS.map((key) => (
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
                {PAGE_LABELS[key]}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 min-h-0 overflow-auto">
        {activePage === 'home' && <Home onNavigate={navigate} />}
        {activePage === 'profile' && <Profile />}
        {activePage === 'preview' && <Preview />}
        {activePage === 'about' && <About />}
        {activePage === 'contact' && <Contact />}
      </main>

      <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--footer-bg)] px-8 py-3 flex items-center justify-between text-xs text-[var(--text)]">
        <span>&copy; {new Date().getFullYear()} Resume Tailor</span>
        <span>Built with React &amp; Tailwind CSS</span>
      </footer>
    </div>
  )
}

export default App
