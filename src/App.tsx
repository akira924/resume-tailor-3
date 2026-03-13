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
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg)]">
        <nav className="flex items-center justify-center gap-1 px-4 py-2">
          {(Object.keys(pages) as Page[]).map((key) => (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activePage === key
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'
              }`}
            >
              {pages[key].label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 min-h-0 overflow-auto">
        <ActiveComponent />
      </main>

      <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-center text-xs text-[var(--text)]">
        &copy; {new Date().getFullYear()} Resume Tailor. All rights reserved.
      </footer>
    </div>
  )
}

export default App
