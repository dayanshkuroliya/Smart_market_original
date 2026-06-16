// components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { useDarkMode } from '../hooks/useDarkMode'

const nav = [
  { to: '/',            label: 'Dashboard' },
  { to: '/vendors',     label: 'Vendors'},
  { to: '/collection',  label: 'Daily Collection' },
  { to: '/pending',     label: 'Pending Payments'},
  { to: '/history',     label: 'Payment History'},
  { to: '/analytics',   label: 'Analytics' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useDarkMode()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-64
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        flex flex-col transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg">🏬</div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Smart Market</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Collection Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom area */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {/* <span>{dark ? '☀️' : '🌙'}</span> */}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User info + logout */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-500">Collector</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-gray-400 hover:text-red-500 text-lg">⏻</button>
          </div>
        </div>
      </aside>
    </>
  )
}
