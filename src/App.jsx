import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import LoginPage from './pages/LoginPage'
import CatalogPage from './pages/CatalogPage'
import CartPage from './pages/CartPage'
import AdminPage from './pages/AdminPage'
import PedidosPage from './pages/PedidosPage'
import Layout from './components/Layout'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, perfil, loading } = useAuth()
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  )
  
  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && perfil?.rol !== 'admin') return <Navigate to="/catalogo" replace />
  
  return children
}

function AppRoutes() {
  const { user, perfil, loading } = useAuth()
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-orange-600 font-medium">Cargando SELOGAS...</p>
      </div>
    </div>
  )
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/catalogo" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to={user ? "/catalogo" : "/login"} replace />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}