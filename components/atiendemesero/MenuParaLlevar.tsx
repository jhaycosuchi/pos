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
    <div className="flex flex-col h-screen bg-gray-900 text-white md:flex-row">
      {/* Panel izquierdo - Categorías y Menú (Completo en móvil) */}
      <div className="flex-1 flex flex-col md:w-3/4 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800/95 backdrop-blur-md shadow-xl p-2 sm:p-3 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white truncate">Pedido Para Llevar</h1>
            <button
              onClick={() => router.push('/atiendemesero')}
              className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-600 transition font-medium flex-shrink-0"
            >
              Volver
            </button>
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

        {/* Items del menú */}
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
      </div>

      {/* Panel derecho - Carrito (Drawer en móvil, panel en desktop) */}
      <div className="w-full md:w-1/4 bg-gray-800 border-t md:border-t-0 md:border-l border-gray-700 shadow-2xl flex flex-col md:h-screen">
        {/* Header del carrito */}
        <div className="p-2 sm:p-3 border-b border-gray-700 bg-gradient-to-r from-orange-900/30 to-gray-800 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-white">Carrito</h2>
          <p className="text-xs sm:text-sm text-orange-400 font-medium">Para Llevar</p>
        </div>

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-gray-900">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-4 sm:mt-8">
              <div className="text-4xl sm:text-5xl mb-2 sm:mb-4">🛒</div>
              <p className="text-xs sm:text-sm">El carrito está vacío</p>
              <p className="text-xs text-gray-600 mt-1">Agrega items del menú</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((cartItem) => (
                <div key={cartItem.id} className="bg-gray-800 rounded-lg p-2 border border-gray-700 shadow-md">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{cartItem.item.nombre}</h4>
                      <p className="text-xs text-gray-400">${cartItem.item.precio.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => eliminarDelCarrito(cartItem.id)}
                      className="text-red-500 hover:text-red-400 ml-2 text-sm font-bold flex-shrink-0"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Control de cantidad */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => actualizarCantidad(cartItem.id, Math.max(1, cartItem.quantity - 1))}
                        className="w-6 h-6 bg-gray-700 rounded-full hover:bg-gray-600 transition font-bold text-white text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-white text-xs">{cartItem.quantity}</span>
                      <button
                        onClick={() => actualizarCantidad(cartItem.id, cartItem.quantity + 1)}
                        className="w-6 h-6 bg-orange-600 rounded-full hover:bg-orange-500 transition font-bold text-white text-xs"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-bold text-orange-500 text-xs flex-shrink-0">
                      ${(cartItem.item.precio * cartItem.quantity).toFixed(2)}
                    </div>
                  </div>


                  {/* Modificaciones */}
                  {cartItem.options && cartItem.options.notas && cartItem.options.notas.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="font-medium">Notas:</p>
                      <ul className="list-disc list-inside">
                        {cartItem.options.notas.map((nota, idx) => (
                          <li key={idx}>{nota}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cartItem.options && cartItem.options.notaPersonalizada && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="font-medium">Nota personalizada: {cartItem.options.notaPersonalizada}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer del carrito - Total y botones */}
        <div className="border-t border-gray-700 p-2 sm:p-3 space-y-2 bg-gray-800 flex-shrink-0">
          {/* Campo de observaciones */}
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Agregar instrucciones especiales..."
            className="w-full p-2 text-xs bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
            rows={2}
          />
          
          <div className="flex items-center justify-between text-lg sm:text-2xl font-bold">
            <span className="text-gray-300 text-xs sm:text-base">Total:</span>
            <span className="text-orange-500">${total.toFixed(2)}</span>
          </div>
          
          <button
            onClick={handleFinalizarPedido}
            disabled={cart.length === 0 || procesando}
            className={`w-full py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-base transition-all transform ${
              cart.length === 0 || procesando
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 shadow-lg shadow-orange-500/50 hover:scale-105'
            }`}
          >
            {procesando ? 'Procesando...' : '✓ Finalizar'}
          </button>
        </div>
      </div>

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
