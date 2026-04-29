import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'
import { Search, ShoppingCart, Plus, Minus, Package, Filter } from 'lucide-react'

export default function CatalogPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const { addItem, items, updateCantidad } = useCart()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('productos').select('*, categorias(nombre, color)').eq('activo', true).order('nombre'),
      supabase.from('categorias').select('*').order('orden')
    ])
    setProductos(prods || [])
    setCategorias(cats || [])
    setLoading(false)
  }

  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaActiva === 'todas' || p.categoria_id === categoriaActiva
    const matchBusq = !busqueda || 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.referencia?.toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchBusq
  })

  const getItemCantidad = (id) => {
    const item = items.find(i => i.id === id)
    return item?.cantidad || 0
  }

  const handleAdd = (producto) => {
    addItem(producto, 1)
  }

  const handleUpdateCantidad = (id, delta) => {
    const current = getItemCantidad(id)
    updateCantidad(id, current + delta)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Catálogo de Productos</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setCategoriaActiva('todas')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${categoriaActiva === 'todas' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${categoriaActiva === cat.id 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Products count */}
      <p className="text-sm text-gray-500 mb-4">
        {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
        {busqueda && ` para "${busqueda}"`}
      </p>

      {/* Products grid */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">No se encontraron productos</p>
          {busqueda && <p className="text-sm mt-1">Intenta con otra búsqueda</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {productosFiltrados.map(producto => {
            const cantidad = getItemCantidad(producto.id)
            return (
              <div key={producto.id} className="card hover:shadow-md transition-shadow">
                {/* Product image placeholder */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {producto.imagen_url ? (
                    <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={32} className="text-gray-300" />
                  )}
                </div>

                {/* Product info */}
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-0.5">{producto.referencia}</p>
                  <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">{producto.nombre}</p>
                  {producto.categorias && (
                    <span className="inline-block text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full mt-1">
                      {producto.categorias.nombre}
                    </span>
                  )}
                  {producto.precio > 0 && (
                    <p className="text-base font-bold text-orange-600 mt-1">
                      {producto.precio.toFixed(2)} €
                    </p>
                  )}
                </div>

                {/* Add to cart */}
                {cantidad === 0 ? (
                  <button
                    onClick={() => handleAdd(producto)}
                    className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-1"
                  >
                    <Plus size={16} />
                    Añadir
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleUpdateCantidad(producto.id, -1)}
                      className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-gray-800 text-lg">{cantidad}</span>
                    <button
                      onClick={() => handleUpdateCantidad(producto.id, 1)}
                      className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}