import { useState, useCallback } from 'react'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Preview from './pages/Preview'
import About from './pages/About'
import Contact from './pages/Contact'
import { useTheme } from './hooks/useTheme'

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
  const { theme, toggle: toggleTheme } = useTheme()

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

            <div className="w-px h-5 bg-[var(--border)] mx-2" />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
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
