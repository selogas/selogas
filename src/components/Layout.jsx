import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, ClipboardList, Settings, LogOut, Menu, X, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function Layout() {
  const { perfil, signOut, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { path: '/catalogo', icon: Package, label: 'Catálogo' },
    { path: '/carrito', icon: ShoppingCart, label: 'Carrito', badge: totalItems },
    { path: '/pedidos', icon: ClipboardList, label: 'Mis Pedidos' },
    ...(isAdmin ? [{ path: '/admin', icon: Settings, label: 'Administración' }] : [])
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/catalogo" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SG</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">SELOGAS</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, icon: Icon, label, badge }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative
                    ${location.pathname === path 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={18} />
                  {label}
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{perfil?.nombre || 'Usuario'}</p>
                <p className="text-xs text-gray-500 capitalize">{perfil?.rol || ''}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.map(({ path, icon: Icon, label, badge }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium relative
                    ${location.pathname === path 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={18} />
                  {label}
                  {badge > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}