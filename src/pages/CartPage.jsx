import React, { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, Send, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function CartPage() {
  const { items, updateCantidad, removeItem, clearCart, totalItems, totalPrecio } = useCart()
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleEnviarPedido = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError('')

    try {
      // Create pedido in database
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          tienda_id: perfil?.tienda_id,
          perfil_id: perfil?.id,
          notas: notas,
          estado: 'pendiente',
          total: totalPrecio
        })
        .select()
        .single()

      if (pedidoError) throw pedidoError

      // Create pedido items
      const pedidoItems = items.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio || 0,
        nombre_producto: item.nombre
      }))

      const { error: itemsError } = await supabase
        .from('pedido_items')
        .insert(pedidoItems)

      if (itemsError) throw itemsError

      // Send email via edge function
      try {
        await supabase.functions.invoke('send-order-email', {
          body: {
            pedido_id: pedido.id,
            tienda_nombre: perfil?.nombre || 'Cliente',
            items: items,
            notas: notas,
            total: totalPrecio
          }
        })
      } catch (emailError) {
        console.warn('Email no enviado:', emailError)
        // Don't fail the order if email fails
      }

      clearCart()
      setSuccess(true)
      setTimeout(() => navigate('/pedidos'), 2000)
    } catch (err) {
      setError('Error al enviar el pedido: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido enviado!</h2>
        <p className="text-gray-500">Redirigiendo a tus pedidos...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ShoppingCart size={64} className="mb-4 opacity-30" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h2>
        <p className="mb-6">Añade productos del catálogo para hacer un pedido</p>
        <Link to="/catalogo" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={18} />
          Ir al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carrito</h1>
        <span className="text-sm text-gray-500">{totalItems} producto{totalItems !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={item.id} className="card flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{item.nombre}</p>
              <p className="text-xs text-gray-400">{item.referencia}</p>
              {item.precio > 0 && (
                <p className="text-sm font-semibold text-orange-600 mt-0.5">
                  {(item.precio * item.cantidad).toFixed(2)} € 
                  <span className="text-gray-400 font-normal"> ({item.precio.toFixed(2)} c/u)</span>
                </p>
              )}
            </div>
            
            {/* Quantity controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateCantidad(item.id, item.cantidad - 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold text-gray-800">{item.cantidad}</span>
              <button
                onClick={() => updateCantidad(item.id, item.cantidad + 1)}
                className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center ml-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notas del pedido (opcional)</label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Instrucciones especiales, urgencia, etc."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>

      {/* Summary */}
      <div className="card mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Productos</span>
          <span>{totalItems} uds</span>
        </div>
        {totalPrecio > 0 && (
          <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2 mt-2">
            <span>Total</span>
            <span className="text-orange-600">{totalPrecio.toFixed(2)} €</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/catalogo" className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={18} />
          Seguir comprando
        </Link>
        <button
          onClick={handleEnviarPedido}
          disabled={loading}
          className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send size={18} />
              Enviar pedido
            </>
          )}
        </button>
      </div>
    </div>
  )
}