import React, { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/Dashboard'

export default function App() {
  useEffect(() => {
    // Ensure document and body stay in pure light mode
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
    document.body.style.backgroundColor = '#dce8f5'
    document.body.style.color = '#1e293b'
    try {
      localStorage.removeItem('olist-theme')
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4eff9] via-[#d5e6f6] to-[#c7dcf0] text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto py-2">
        <Dashboard />
      </main>
    </div>
  )
}
