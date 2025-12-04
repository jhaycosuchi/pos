'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  ChefHat, 
  User, 
  ShoppingBag,
  Receipt,
  Plus,
  X,
  CheckCircle2,
  DollarSign,
  Utensils,
  AlertCircle,
  Edit,
  Trash2,
  Shield
} from 'lucide-react'
import { API, PAGES, ROUTES, ESTADOS } from '@/lib/config'

interface CuentaActiva {
  id: number
  numero_cuenta: string
  numero_pedido?: string
  mesa_numero: number | string | null
  mesero_nombre: string
  total: number
  total_pedidos: number
  fecha_apertura: string
  creado_en?: string
  estado: string
  es_para_llevar?: number
  tipo?: 'cuenta' | 'pedido_llevar'
}

interface PedidoCuenta {
  id: number
  numero_pedido: string
  es_para_llevar: number
  estado: string
  total: number
  creado_en: string
  items?: { 
    nombre: string
    cantidad: number
    precio_unitario: number
    notas?: string
    especificaciones?: string
  }[]
}

interface CuentaDetalle extends CuentaActiva {
  pedidos: PedidoCuenta[]
}

export default function AreasActivasPage() {
  const router = useRouter()
  const [cuentasAbiertas, setCuentasAbiertas] = useState<CuentaActiva[]>([])
  const [cuentasCerradas, setCuentasCerradas] = useState<CuentaActiva[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [meseroNombre, setMeseroNombre] = useState('')
  const [activeTab, setActiveTab] = useState<'mesa' | 'llevar' | 'cobrar'>('mesa')
  
  // Modal para ver detalle de cuenta
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaDetalle | null>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  
  // Modal para cerrar cuenta
  const [showCerrarModal, setShowCerrarModal] = useState(false)
  const [cuentaACerrar, setCuentaACerrar] = useState<CuentaActiva | null>(null)
  const [cerrando, setCerrando] = useState(false)

  // Modal para editar pedido
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [pedidoAEditar, setPedidoAEditar] = useState<PedidoCuenta | null>(null)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    const storedMesero = localStorage.getItem('pos_user')
    if (storedMesero) {
      try {
        const mesero = JSON.parse(storedMesero)
        setMeseroNombre(mesero.nombre || mesero.name || 'Mesero')
      } catch (e) {
        console.error('Error parsing mesero data:', e)
      }
    }
    
    fetchCuentas()
    const interval = setInterval(fetchCuentas, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchCuentas = async () => {
    try {
      // Usar el endpoint /areas-activas que devuelve cuentas + pedidos para llevar
      const response = await fetch(API.AREAS_ACTIVAS)
      if (response.ok) {
        const data = await response.json()
        const allItems = Array.isArray(data) ? data : data.data || []
        
        // Separar cuentas abiertas (tipo: cuenta, estado: abierta)
        // Y cuentas cerradas (tipo: cuenta, estado: cerrada)
        // También incluir pedidos para llevar (tipo: pedido_llevar, estado: pendiente)
        const cuentasAbiertas = allItems.filter((item: any) => {
          if (item.tipo === 'pedido_llevar') return item.estado === 'pendiente'
          return item.estado === 'abierta'
        })
        
        const cuentasCerradas = allItems.filter((item: any) => 
          item.tipo === 'cuenta' && item.estado === 'cerrada'
        )
        
        setCuentasAbiertas(cuentasAbiertas)
        setCuentasCerradas(cuentasCerradas)
      }
    } catch (error) {
      console.error('Error fetching cuentas:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCuentas()
  }

  const fetchDetalleCuenta = async (cuentaId: number) => {
    setLoadingDetalle(true)
    try {
      const response = await fetch(API.CUENTA_BY_ID(cuentaId))
      if (response.ok) {
        const result = await response.json()
        // El API devuelve {success: true, data: {...}} o directamente {...}
        const data = result.data || result
        setSelectedCuenta(data)
        setShowDetalleModal(true)
      }
    } catch (error) {
      console.error('Error fetching cuenta detalle:', error)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleAddParaLlevar = (cuenta: CuentaActiva) => {
    localStorage.setItem('mesa', JSON.stringify({
      numero: cuenta.mesa_numero || 'LLEVAR',
      cuentaId: cuenta.id,
      numeroCuenta: cuenta.numero_cuenta
    }))
    router.push(ROUTES.atiendemeseroParaLlevar(cuenta.id))
  }

  const handleAddPedidoMesa = (cuenta: CuentaActiva) => {
    localStorage.setItem('mesa', JSON.stringify({
      numero: cuenta.mesa_numero,
      cuentaId: cuenta.id,
      numeroCuenta: cuenta.numero_cuenta
    }))
    router.push(ROUTES.atiendemeseroConCuenta(cuenta.id))
  }

  const handleCerrarCuenta = (cuenta: CuentaActiva) => {
    setCuentaACerrar(cuenta)
    setShowCerrarModal(true)
  }

  const confirmarCerrarCuenta = async () => {
    if (!cuentaACerrar) return
    
    setCerrando(true)
    try {
      const response = await fetch(API.CUENTA_BY_ID(cuentaACerrar.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: ESTADOS.CUENTA.CERRADA })
      })
      
      if (response.ok) {
        // Mover de abiertas a cerradas
        setCuentasAbiertas(prev => prev.filter(c => c.id !== cuentaACerrar.id))
        setCuentasCerradas(prev => [...prev, { ...cuentaACerrar, estado: ESTADOS.CUENTA.CERRADA }])
        setShowCerrarModal(false)
        setCuentaACerrar(null)
      } else {
        alert('Error al cerrar la cuenta')
      }
    } catch (error) {
      console.error('Error cerrando cuenta:', error)
      alert('Error al cerrar la cuenta')
    } finally {
      setCerrando(false)
    }
  }

  const handleEditarPedido = (pedido: PedidoCuenta) => {
    setPedidoAEditar(pedido)
    setShowEditarModal(true)
  }

  const handleEliminarPedido = async (pedido: PedidoCuenta) => {
    if (!confirm(`¿Estás seguro de que quieres solicitar la eliminación del pedido ${pedido.numero_pedido}?`)) {
      return
    }

    try {
      // Crear petición de eliminación pendiente de autorización
      const response = await fetch(API.MODIFICACIONES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'eliminacion',
          pedido_id: pedido.id,
          cuenta_id: selectedCuenta?.id,
          solicitado_por: meseroNombre,
          detalles: `Solicitud de eliminación del pedido ${pedido.numero_pedido}`
        })
      })

      if (response.ok) {
        alert('✅ Petición de eliminación enviada. Espera autorización de caja.')
        setShowDetalleModal(false)
      } else {
        alert('Error al enviar la petición')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la petición')
    }
  }

  const handleGuardarEdicion = async () => {
    if (!pedidoAEditar) return

    setEditando(true)
    try {
      // Crear petición de modificación pendiente de autorización
      const response = await fetch(API.MODIFICACIONES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'edicion',
          pedido_id: pedidoAEditar.id,
          cuenta_id: selectedCuenta?.id,
          solicitado_por: meseroNombre,
          detalles: `Solicitud de edición del pedido ${pedidoAEditar.numero_pedido}`,
          cambios: 'Edición de items del pedido'
        })
      })

      if (response.ok) {
        alert('✅ Petición de edición enviada. Espera autorización de caja.')
        setShowEditarModal(false)
        setPedidoAEditar(null)
      } else {
        alert('Error al enviar la petición')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la petición')
    } finally {
      setEditando(false)
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return '--:--'
    
    try {
      // Si la fecha no tiene timezone, agregar Z para interpretarla como UTC
      let date: Date
      if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
        date = new Date(dateString + 'Z')
      } else {
        date = new Date(dateString)
      }
      
      if (isNaN(date.getTime())) return '--:--'
      
      return date.toLocaleTimeString('es-MX', { 
        timeZone: 'America/Mexico_City',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    } catch (error) {
      return '--:--'
    }
  }

  const getTimeSince = (dateString: string) => {
    if (!dateString) return '0 min'
    
    try {
      // Si la fecha no tiene timezone, agregar Z para interpretarla como UTC
      let start: Date
      if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
        start = new Date(dateString + 'Z')
      } else {
        start = new Date(dateString)
      }
      
      if (isNaN(start.getTime())) return '0 min'
      
      const now = new Date()
      const diffMs = now.getTime() - start.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 0) return 'recién'
      if (diffMins < 1) return 'menos de 1 min'
      if (diffMins < 60) return `${diffMins} min`
      
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return `${hours}h ${mins}m`
    } catch (error) {
      return '0 min'
    }
  }

  // Filtrar cuentas según el tab
  // Para mesas: cuentas de tipo 'cuenta' con mesa_numero que no sea 'PARA_LLEVAR'
  // Para llevar: cuentas de tipo 'cuenta' con mesa_numero = 'PARA_LLEVAR' + pedidos de tipo 'pedido_llevar'
  const cuentasMesa = cuentasAbiertas.filter(c => 
    c.tipo === 'cuenta' && c.mesa_numero && c.mesa_numero !== 'PARA_LLEVAR'
  )
  const cuentasLlevar = cuentasAbiertas.filter(c => 
    (c.tipo === 'cuenta' && (c.mesa_numero === 'PARA_LLEVAR' || !c.mesa_numero)) || 
    c.tipo === 'pedido_llevar'
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Cargando cuentas activas...</p>
        </div>
      </div>
    )
  }

  const renderCuentaCard = (cuenta: CuentaActiva, isPorCobrar: boolean = false) => (
    <motion.div
      key={cuenta.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`backdrop-blur-sm rounded-xl p-3 border transition-all hover:shadow-lg ${
        isPorCobrar 
          ? 'bg-yellow-500/20 border-yellow-400/40 hover:border-yellow-400/60' 
          : cuenta.mesa_numero && cuenta.mesa_numero !== 'PARA_LLEVAR'
            ? 'bg-blue-500/20 border-blue-400/40 hover:border-blue-400/60'
            : 'bg-orange-500/20 border-orange-400/40 hover:border-orange-400/60'
      }`}
    >
      {/* Header compacto */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            isPorCobrar 
              ? 'bg-yellow-500 text-white'
              : cuenta.mesa_numero && cuenta.mesa_numero !== 'PARA_LLEVAR'
                ? 'bg-blue-500 text-white'
                : 'bg-orange-500 text-white'
          }`}>
            {cuenta.mesa_numero && cuenta.mesa_numero !== 'PARA_LLEVAR' ? (
              cuenta.mesa_numero
            ) : cuenta.tipo === 'pedido_llevar' ? (
              <ShoppingBag className="w-5 h-5" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">
              {cuenta.tipo === 'pedido_llevar' ? cuenta.numero_pedido : cuenta.numero_cuenta}
            </h3>
            <p className="text-white/60 text-xs truncate">
              {cuenta.mesero_nombre}
            </p>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <p className="text-green-400 font-bold text-sm">
            ${(cuenta.total || 0).toFixed(2)}
          </p>
          {cuenta.tipo !== 'pedido_llevar' && (
            <p className="text-white/60 text-xs">
              {cuenta.total_pedidos} ped.
            </p>
          )}
        </div>
      </div>

      {/* Info compacta */}
      {!isPorCobrar && (
        <div className="text-white/60 text-xs mb-2 px-1">
          {formatTime(cuenta.tipo === 'pedido_llevar' ? (cuenta.creado_en || cuenta.fecha_apertura) : cuenta.fecha_apertura)} • {getTimeSince(cuenta.tipo === 'pedido_llevar' ? (cuenta.creado_en || cuenta.fecha_apertura) : cuenta.fecha_apertura)}
        </div>
      )}

      {/* Botones */}
      {isPorCobrar ? (
        <button
          onClick={() => fetchDetalleCuenta(cuenta.id)}
          disabled={loadingDetalle}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <Receipt className="w-4 h-4" />
          <span>Ver Detalle</span>
        </button>
      ) : cuenta.tipo === 'pedido_llevar' ? (
        // Para pedidos para llevar, solo mostrar botón de ver detalle
        <button
          onClick={() => fetchDetalleCuenta(cuenta.id)}
          disabled={loadingDetalle}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
          title="Ver detalles del pedido"
        >
          <Receipt className="w-4 h-4" />
          <span>Ver Pedido</span>
        </button>
      ) : (
        // Para cuentas de mesa
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => fetchDetalleCuenta(cuenta.id)}
            disabled={loadingDetalle}
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center transition-colors"
            title="Ver detalles"
          >
            <Receipt className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => cuenta.mesa_numero && cuenta.mesa_numero !== 'PARA_LLEVAR' ? handleAddPedidoMesa(cuenta) : handleAddParaLlevar(cuenta)}
            className="bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg flex items-center justify-center transition-colors"
            title="Agregar item"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleCerrarCuenta(cuenta)}
            className="bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg flex items-center justify-center transition-colors"
            title="Cerrar cuenta"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push(PAGES.ATIENDEMESERO)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Áreas Activas</h1>
            <p className="text-blue-200 text-sm">{meseroNombre}</p>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/50 p-2 mx-4 mt-4 rounded-xl flex gap-2">
        <button
          onClick={() => setActiveTab('mesa')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'mesa' 
              ? 'bg-blue-600 text-white' 
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span>Mesas</span>
          {cuentasMesa.length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {cuentasMesa.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('llevar')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'llevar' 
              ? 'bg-orange-600 text-white' 
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Llevar</span>
          {cuentasLlevar.length > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {cuentasLlevar.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('cobrar')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'cobrar' 
              ? 'bg-yellow-600 text-white' 
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span>Cobrar</span>
          {cuentasCerradas.length > 0 && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
              {cuentasCerradas.length}
            </span>
          )}
        </button>
      </div>

      {/* Lista de Cuentas */}
      <div className="p-4">
        {activeTab === 'mesa' && (
          <>
            {cuentasMesa.length === 0 ? (
              <div className="text-center py-16">
                <Utensils className="w-20 h-20 text-blue-400/50 mx-auto mb-4" />
                <p className="text-white/70 text-lg">No hay mesas activas</p>
                <p className="text-white/50 text-sm mt-2">Las cuentas se crean al tomar pedidos</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {cuentasMesa.map((cuenta) => renderCuentaCard(cuenta))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {activeTab === 'llevar' && (
          <>
            {cuentasLlevar.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-20 h-20 text-orange-400/50 mx-auto mb-4" />
                <p className="text-white/70 text-lg">No hay pedidos para llevar</p>
                <p className="text-white/50 text-sm mt-2">Las cuentas se crean al tomar pedidos para llevar</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {cuentasLlevar.map((cuenta) => renderCuentaCard(cuenta))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {activeTab === 'cobrar' && (
          <>
            {cuentasCerradas.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign className="w-20 h-20 text-yellow-400/50 mx-auto mb-4" />
                <p className="text-white/70 text-lg">No hay cuentas por cobrar</p>
                <p className="text-white/50 text-sm mt-2">Las cuentas cerradas aparecerán aquí</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {cuentasCerradas.map((cuenta) => renderCuentaCard(cuenta, true))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Detalle de Cuenta */}
      <AnimatePresence>
        {showDetalleModal && selectedCuenta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowDetalleModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-hidden"
            >
              <div className="bg-blue-600 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">{selectedCuenta.numero_cuenta}</h2>
                  <p className="text-blue-200 text-sm">
                    {selectedCuenta.mesa_numero && selectedCuenta.mesa_numero !== 'LLEVAR' 
                      ? `Mesa ${selectedCuenta.mesa_numero}` 
                      : 'Para Llevar'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetalleModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[50vh]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Pedidos en esta cuenta:</h3>
                  <span className="text-blue-300 text-sm">
                    👤 {selectedCuenta.mesero_nombre}
                  </span>
                </div>
                
                {selectedCuenta.pedidos && selectedCuenta.pedidos.length > 0 ? (
                  <div className="space-y-4">
                    {/* Pedidos para comer */}
                    {selectedCuenta.pedidos.filter(p => !p.es_para_llevar).length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-blue-300 text-sm font-medium mb-3 flex items-center gap-2 bg-blue-500/10 p-2 rounded-lg">
                          <Utensils className="w-4 h-4" />
                          🍽️ Para comer aquí
                        </h4>
                        {selectedCuenta.pedidos.filter(p => !p.es_para_llevar).map((pedido) => (
                          <div
                            key={pedido.id}
                            className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/30 mb-3"
                          >
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-400/20">
                              <div>
                                <span className="text-white font-bold text-lg">
                                  {pedido.numero_pedido}
                                </span>
                                <p className="text-blue-300 text-xs">
                                  {formatTime(pedido.creado_en)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  pedido.estado === ESTADOS.PEDIDO.PENDIENTE ? 'bg-yellow-500 text-yellow-900' :
                                  pedido.estado === ESTADOS.PEDIDO.PREPARANDO ? 'bg-blue-500 text-white' :
                                  pedido.estado === ESTADOS.PEDIDO.LISTO ? 'bg-green-500 text-white' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {pedido.estado?.toUpperCase()}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditarPedido(pedido)}
                                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                                    title="Editar pedido"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEliminarPedido(pedido)}
                                    className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                                    title="Eliminar pedido"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Items del pedido */}
                            {pedido.items && pedido.items.length > 0 ? (
                              <div className="space-y-2 mb-3">
                                {pedido.items.map((item, idx) => (
                                  <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="text-white font-medium">
                                          <span className="text-blue-400 font-bold">{item.cantidad}x</span> {item.nombre}
                                        </p>
                                        {(item.notas || item.especificaciones) && (
                                          <p className="text-yellow-300 text-xs mt-1 italic">
                                            📝 {item.notas || item.especificaciones}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-green-400 font-semibold ml-2">
                                        ${(item.cantidad * item.precio_unitario).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-white/50 text-sm italic">Sin detalles</p>
                            )}
                            
                            <div className="text-right pt-2 border-t border-blue-400/20">
                              <span className="text-white/70 text-sm">Subtotal: </span>
                              <span className="text-green-400 font-bold text-lg">
                                ${(pedido.total || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pedidos para llevar */}
                    {selectedCuenta.pedidos.filter(p => p.es_para_llevar).length > 0 && (
                      <div>
                        <h4 className="text-orange-300 text-sm font-medium mb-3 flex items-center gap-2 bg-orange-500/10 p-2 rounded-lg">
                          <ShoppingBag className="w-4 h-4" />
                          🛍️ Para llevar
                        </h4>
                        {selectedCuenta.pedidos.filter(p => p.es_para_llevar).map((pedido) => (
                          <div
                            key={pedido.id}
                            className="bg-orange-500/20 rounded-xl p-4 border border-orange-400/30 mb-3"
                          >
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-orange-400/20">
                              <div>
                                <span className="text-white font-bold text-lg">
                                  {pedido.numero_pedido}
                                </span>
                                <p className="text-orange-300 text-xs">
                                  {formatTime(pedido.creado_en)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  pedido.estado === ESTADOS.PEDIDO.PENDIENTE ? 'bg-yellow-500 text-yellow-900' :
                                  pedido.estado === ESTADOS.PEDIDO.PREPARANDO ? 'bg-blue-500 text-white' :
                                  pedido.estado === ESTADOS.PEDIDO.LISTO ? 'bg-green-500 text-white' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {pedido.estado?.toUpperCase()}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditarPedido(pedido)}
                                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                                    title="Editar pedido"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEliminarPedido(pedido)}
                                    className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                                    title="Eliminar pedido"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Items del pedido */}
                            {pedido.items && pedido.items.length > 0 ? (
                              <div className="space-y-2 mb-3">
                                {pedido.items.map((item, idx) => (
                                  <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="text-white font-medium">
                                          <span className="text-orange-400 font-bold">{item.cantidad}x</span> {item.nombre}
                                        </p>
                                        {(item.notas || item.especificaciones) && (
                                          <p className="text-yellow-300 text-xs mt-1 italic">
                                            📝 {item.notas || item.especificaciones}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-green-400 font-semibold ml-2">
                                        ${(item.cantidad * item.precio_unitario).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-white/50 text-sm italic">Sin detalles</p>
                            )}
                            
                            <div className="text-right pt-2 border-t border-orange-400/20">
                              <span className="text-white/70 text-sm">Subtotal: </span>
                              <span className="text-green-400 font-bold text-lg">
                                ${(pedido.total || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white/50 text-center py-4">No hay pedidos aún</p>
                )}
              </div>

              <div className="border-t border-white/20 p-4 bg-slate-900">
                <div className="flex items-center justify-between text-white">
                  <span className="font-semibold">Total de la cuenta:</span>
                  <span className="text-2xl font-bold text-green-400">
                    ${(selectedCuenta.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Cerrar Cuenta */}
      <AnimatePresence>
        {showCerrarModal && cuentaACerrar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCerrarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">¿Cerrar Cuenta?</h3>
                <p className="text-white/70">
                  {cuentaACerrar.numero_cuenta}
                </p>
                <p className="text-white/50 text-sm">
                  {cuentaACerrar.mesa_numero && cuentaACerrar.mesa_numero !== 'LLEVAR' 
                    ? `Mesa ${cuentaACerrar.mesa_numero}` 
                    : 'Para Llevar'}
                </p>
                <p className="text-green-400 font-bold text-2xl mt-2">
                  ${(cuentaACerrar.total || 0).toFixed(2)}
                </p>
              </div>
              
              <p className="text-white/60 text-sm text-center mb-6">
                Al cerrar la cuenta, pasará a <strong className="text-yellow-400">caja para cobro</strong>. 
                No se podrán agregar más pedidos.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowCerrarModal(false)}
                  className="bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCerrarCuenta}
                  disabled={cerrando}
                  className="bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {cerrando ? 'Cerrando...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Editar Pedido */}
      <AnimatePresence>
        {showEditarModal && pedidoAEditar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Edit className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">Editar Pedido</h3>
                    <p className="text-blue-300 text-sm">{pedidoAEditar.numero_pedido}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditarModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">Autorización Requerida</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Los cambios en pedidos existentes requieren autorización de caja.
                    Se enviará una petición que debe ser aprobada antes de aplicar los cambios.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Items actuales:</h4>
                  {pedidoAEditar.items && pedidoAEditar.items.length > 0 ? (
                    <div className="space-y-2">
                      {pedidoAEditar.items.map((item, idx) => (
                        <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                <span className="text-blue-400 font-bold">{item.cantidad}x</span> {item.nombre}
                              </p>
                              {(item.notas || item.especificaciones) && (
                                <p className="text-yellow-300 text-xs mt-1 italic">
                                  📝 {item.notas || item.especificaciones}
                                </p>
                              )}
                            </div>
                            <span className="text-green-400 font-semibold ml-2">
                              ${(item.cantidad * item.precio_unitario).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 text-sm italic">Sin items</p>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">¿Qué deseas hacer?</h4>
                  <p className="text-white/70 text-sm mb-3">
                    Selecciona la acción que quieres solicitar:
                  </p>
                  <div className="space-y-2">
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Agregar items al pedido
                    </button>
                    <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      Modificar cantidades/notas
                    </button>
                    <button className="w-full bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Eliminar items del pedido
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditarModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEdicion}
                  disabled={editando}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {editando ? 'Enviando...' : 'Enviar Petición'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

