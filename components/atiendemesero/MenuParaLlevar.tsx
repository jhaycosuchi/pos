/**
 * Componente de menú para pedidos para llevar
 * Muestra el menú y gestiona el carrito usando el contexto global
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePedidoContext } from '@/lib/context/PedidoContext';
import { MenuService, AuthService } from '@/lib/services';
import { MenuItem, MenuCategory } from '@/lib/services/menu.service';
import ProductModal from '@/components/atiendemesero/ProductModal';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function MenuParaLlevar() {
  const router = useRouter();
  const { cart, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, calcularTotal, mesaNumero, limpiarTodo } = usePedidoContext();
  const [categorias, setCategorias] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ numero_pedido: '', total: 0 });
  const [observaciones, setObservaciones] = useState('');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    cargarMenu();
  }, []);

  const cargarMenu = async () => {
    try {
      setLoading(true);
      const data = await MenuService.obtenerMenu();
      setCategorias(data);
      if (data.length > 0) {
        setCategoriaSeleccionada(data[0].nombre || data[0].name || '');
      }
    } catch (error) {
      console.error('Error al cargar menú:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarItem = (item: MenuItem) => {
    setSelectedProduct(item);
  };

  const handleAddToCart = (product: MenuItem, notes: string[], customNote: string) => {
    agregarAlCarrito({
      id: `${product.nombre}-${Date.now()}`,
      item: {
        id: product.id,
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio: product.precio,
        imagen_url: product.imagen_url || '',
        categoria: product.categoria
      },
      quantity: 1,
      options: {
        notas: notes,
        notaPersonalizada: customNote
      }
    });
    setSelectedProduct(null);
  };

  const handleFinalizarPedido = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    try {
      setProcesando(true);
      
      // Obtener mesero_id
      const meseroId = AuthService.obtenerMeseroId();
      
      // Calcular total
      const totalPedido = cart.reduce((sum, item) => sum + (item.item.precio * item.quantity), 0);
      
      // Crear pedido
      const response = await fetch('/pos/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mesa_numero: mesaNumero || 'PARA_LLEVAR',
          mesero_id: meseroId,
          comensales: 1,
          es_para_llevar: 1,
          total: totalPedido,
          estado: 'pendiente',
          observaciones: observaciones || null,
          items: cart.map((item: any) => ({
            menu_item_id: item.item.id || 1,
            producto_nombre: item.item.nombre,
            cantidad: item.quantity,
            precio_unitario: item.item.precio,
            subtotal: item.item.precio * item.quantity,
            notas: item.options?.notas?.join(', ') || '',
            especificaciones: item.options?.notaPersonalizada || ''
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      const data = await response.json();
      
      // Mejorar validación y mostrar mejor alert
      const numeroPedido = data.pedido?.numero_pedido || data.numero_pedido || 'Desconocido';
      const total = (data.pedido?.total || data.total || totalPedido).toFixed(2);
      
      setSuccessData({ numero_pedido: numeroPedido, total: parseFloat(total) });
      setShowSuccessModal(true);
      
      // Limpiar después de cerrar el modal
      setTimeout(() => {
        limpiarTodo();
        router.push('/atiendemesero');
      }, 3500);
    } catch (error: any) {
      console.error('Error al crear pedido:', error);
      alert('Error al crear el pedido: ' + (error.message || 'Error desconocido'));
    } finally {
      setProcesando(false);
    }
  };

  const categoriaActual = categorias.find(c => 
    (c.nombre === categoriaSeleccionada) || (c.name === categoriaSeleccionada)
  );
  const total = calcularTotal();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando menú...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/95 backdrop-blur-md shadow-xl p-2 sm:p-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-lg font-bold text-white truncate">Pedido Para Llevar</h1>
          <div className="flex items-center gap-2">
            {/* Cart Button - Opens Modal */}
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-orange-500 hover:bg-orange-600 p-2 sm:p-3 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-gray-900">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push('/atiendemesero')}
              className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-600 transition font-medium flex-shrink-0"
            >
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* Categorías - Scroll Horizontal */}
      <div className="bg-gray-800/50 backdrop-blur border-b border-gray-700 shadow-lg flex-shrink-0 overflow-x-auto scrollbar-hide">
        <div className="flex p-1.5 sm:p-2 space-x-1 sm:space-x-2">
          {categorias.map((categoria, idx) => (
            <button
              key={categoria.id || categoria.nombre || categoria.name || idx}
              onClick={() => setCategoriaSeleccionada(categoria.nombre || categoria.name || '')}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg whitespace-nowrap font-bold transition-all transform hover:scale-105 text-xs ${
                (categoriaSeleccionada === categoria.nombre) || (categoriaSeleccionada === categoria.name)
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/50'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              {categoria.nombre || categoria.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items del menú - FULL SCREEN */}
      <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 bg-gray-900">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {categoriaActual?.items.map((item, idx) => (
            <div
              key={item.nombre + idx}
              className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 cursor-pointer group aspect-square flex flex-col"
              onClick={() => handleAgregarItem(item)}
            >
              {item.imagen_url && (
                <div className="relative flex-1 overflow-hidden">
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>
              )}
              <div className="p-1.5 sm:p-2 flex flex-col justify-end">
                <h3 className="font-bold text-white mb-0.5 text-xs line-clamp-1">{item.nombre}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-orange-500">
                    ${item.precio.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-orange-400 transition">+</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-gray-800 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl pointer-events-auto">
                <button
                  onClick={() => setShowCart(false)}
                  className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-full z-10"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                
                {/* Cart Content */}
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-700 flex-shrink-0">
                  <h2 className="text-base sm:text-lg font-bold text-white">Carrito</h2>
                  <p className="text-xs sm:text-sm text-orange-400 font-medium">Para Llevar</p>
                </div>

                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3 space-y-2 bg-gray-900">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-6">
                      <ShoppingCartIcon className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm font-medium">Carrito vacío</p>
                      <p className="text-xs text-gray-500">Agrega productos</p>
                    </div>
                  ) : (
                    cart.map((cartItem) => (
                      <div key={cartItem.id} className="bg-gray-700/50 rounded-lg p-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm truncate text-white">{cartItem.item.nombre}</h4>
                            <p className="text-orange-400 font-bold text-xs sm:text-sm mt-1">
                              ${(cartItem.item.precio * cartItem.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => eliminarDelCarrito(cartItem.id)}
                            className="p-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 flex-shrink-0"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => actualizarCantidad(cartItem.id, Math.max(1, cartItem.quantity - 1))}
                            className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center text-xs sm:text-sm"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-xs sm:text-sm text-white">{cartItem.quantity}</span>
                          <button
                            onClick={() => actualizarCantidad(cartItem.id, cartItem.quantity + 1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center text-xs sm:text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-700 space-y-3 bg-gray-800 flex-shrink-0">
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Instrucciones especiales..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700 text-white border border-gray-600 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs sm:text-sm resize-none"
                    rows={2}
                  />
                  
                  <div className="bg-gray-700/50 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-400">
                      <span>Productos</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className="flex justify-between text-lg sm:text-xl font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-orange-400">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleFinalizarPedido();
                      setShowCart(false);
                    }}
                    disabled={cart.length === 0 || procesando}
                    className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all ${
                      cart.length === 0 || procesando
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                    }`}
                  >
                    {procesando ? 'Procesando...' : '✓ Finalizar Pedido'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Modal for notes */}
      <ProductModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Pedido Creado!"
        message="Tu pedido ha sido registrado correctamente"
        details={[
          { label: '📋 Número', value: successData.numero_pedido },
          { label: '💵 Total', value: `$${successData.total.toFixed(2)}` },
          { label: '⏱️ Estado', value: 'Pendiente' }
        ]}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
