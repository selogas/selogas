import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (producto, cantidad = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === producto.id)
      if (existing) {
        return prev.map(item => 
          item.id === producto.id 
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      }
      return [...prev, { ...producto, cantidad }]
    })
  }

  const updateCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      removeItem(productoId)
      return
    }
    setItems(prev => prev.map(item => 
      item.id === productoId ? { ...item, cantidad } : item
    ))
  }

  const removeItem = (productoId) => {
    setItems(prev => prev.filter(item => item.id !== productoId))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0)
  const totalPrecio = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateCantidad, removeItem, clearCart, totalItems, totalPrecio }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)