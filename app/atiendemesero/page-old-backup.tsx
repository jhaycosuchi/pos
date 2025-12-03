'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, LogOut, X, ChefHat, DollarSign, Home as HomeIcon } from 'lucide-react';

interface MenuItem {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  imagen_local?: string;
}

interface CartItem extends MenuItem {
  cantidad: number;
  especificaciones: string[];
  notas: string;
}

interface Mesero {
  id: number;
  nombre: string;
  username: string;
}

interface MesaActiva {
  mesaId: number;
  comensales: number;
  tipo: 'para_comer' | 'para_llevar';
  cart: CartItem[];
  total: number;
}

const ESPECIFICACIONES_COMUNES = [
  'Sin wasabi',
  'Sin jengibre',
  'Sin camarón',
  'Sin atún',
  'Sin salmón',
  'Sin queso',
  'Sin mayo',
  'Extra picante',
  'Bajo en salsa',
  'Sin alga nori'
];

const MESAS_CONFIG = [
  { id: 1, comensales: 5, lado: 'izquierda', posicion: 'top' },
  { id: 2, comensales: 3, lado: 'izquierda', posicion: 'middle' },
  { id: 3, comensales: 6, lado: 'izquierda', posicion: 'bottom' },
  { id: 4, comensales: 5, lado: 'derecha', posicion: 'top' },
  { id: 5, comensales: 5, lado: 'derecha', posicion: 'middle' },
  { id: 6, comensales: 5, lado: 'derecha', posicion: 'bottom' }
];

export default function AtiendemeseroPage() {
  const router = useRouter();
  const [mesero, setMesero] = useState<Mesero | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [mesasActivas, setMesasActivas] = useState<MesaActiva[]>([]);
  const [mesaActual, setMesaActual] = useState<number | null>(null);
  const [showMesaSelector, setShowMesaSelector] = useState(false);
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [mesaTemporal, setMesaTemporal] = useState<typeof MESAS_CONFIG[0] | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [tempNotas, setTempNotas] = useState('');
  const [tempSpecs, setTempSpecs] = useState<string[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [pedidosEnSeguimiento, setPedidosEnSeguimiento] = useState<any[]>([]);
  const [mostrarSeguimiento, setMostrarSeguimiento] = useState(false);

  // Verificar sesión
  useEffect(() => {
    const meseroInfo = sessionStorage.getItem('meseroInfo');
    if (!meseroInfo) {
      router.push('/atiendemesero/login');
      return;
    }

    const meseroData = JSON.parse(meseroInfo);
    setMesero(meseroData);
    cargarMenu();
    cargarPedidos();
  }, [router]);

  // Auto-actualizar pedidos cada 5 segundos
  useEffect(() => {
    const interval = setInterval(cargarPedidos, 5000);
    return () => clearInterval(interval);
  }, [mesero?.id]);

  const cargarPedidos = async () => {
    if (!mesero?.id) return;
    try {
      const response = await fetch(`/api/pedidos`);
      if (response.ok) {
        const data = await response.json();
        const misPedidos = data.filter((p: any) => p.mesero_id === mesero.id);
        setPedidosEnSeguimiento(misPedidos);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  const cargarMenu = async () => {
    try {
      const response = await fetch('/pos/api/menu');
      if (response.ok) {
        const data = await response.json();
        const items: MenuItem[] = [];
        const cats = new Set<string>();

        data.forEach((category: any) => {
          cats.add(category.nombre);
          category.items.forEach((item: any) => {
            items.push({
              id: item.id,
              nombre: item.nombre,
              precio: item.precio,
              categoria: category.nombre,
              imagen_local: item.imagen_url
            });
          });
        });

        setMenu(items);
        setCategorias(['Todos', ...Array.from(cats).sort()]);
      }
    } catch (error) {
      console.error('Error cargando menú:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('meseroInfo');
    router.push('/atiendemesero/login');
  };

  // Obtener carrito actual
  const carritoActual = mesaActual 
    ? mesasActivas.find(m => m.mesaId === mesaActual)?.cart || []
    : [];

  // Obtener tipo de servicio actual
  const tipoServicioActual = mesaActual 
    ? mesasActivas.find(m => m.mesaId === mesaActual)?.tipo
    : null;

  // Obtener comensales actual
  const comensalesActual = mesaActual 
    ? mesasActivas.find(m => m.mesaId === mesaActual)?.comensales || 0
    : 0;

  // Obtener total actual
  const totalActual = carritoActual.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const abrirMesa = (mesaConfig: typeof MESAS_CONFIG[0]) => {
    // Verificar si ya está abierta
    if (mesasActivas.find(m => m.mesaId === mesaConfig.id)) {
      setMesaActual(mesaConfig.id);
      setShowMesaSelector(false);
      return;
    }

    setMesaTemporal(mesaConfig);
    setShowServicioModal(true);
  };

  const confirmarServicio = (paraLlevar: boolean) => {
    if (!mesaTemporal) return;

    const nuevaMesa: MesaActiva = {
      mesaId: mesaTemporal.id,
      comensales: mesaTemporal.comensales,
      tipo: paraLlevar ? 'para_llevar' : 'para_comer',
      cart: [],
      total: 0
    };

    setMesasActivas([...mesasActivas, nuevaMesa]);
    setMesaActual(mesaTemporal.id);
    setShowServicioModal(false);
    setMesaTemporal(null);
    setShowMesaSelector(false);
  };

  const cambiarMesa = (mesaId: number | null) => {
    setMesaActual(mesaId);
  };

  const cerrarMesa = (mesaId: number) => {
    setMesasActivas(mesasActivas.filter(m => m.mesaId !== mesaId));
    if (mesaActual === mesaId) {
      setMesaActual(null);
    }
  };

  const addToCart = (item: MenuItem) => {
    if (mesaActual === null) {
      alert('Selecciona una mesa primero');
      return;
    }
    setSelectedItem(item);
    setTempSpecs([]);
    setTempNotas('');
    setShowSpecsModal(true);
  };

  const confirmarAgregacion = () => {
    if (!selectedItem || mesaActual === null) return;

    const nuevoItem: CartItem = {
      ...selectedItem,
      cantidad: 1,
      especificaciones: [...tempSpecs],
      notas: tempNotas
    };

    setMesasActivas(
      mesasActivas.map(mesa => 
        mesa.mesaId === mesaActual
          ? { ...mesa, cart: [...mesa.cart, nuevoItem], total: mesa.total + selectedItem.precio }
          : mesa
      )
    );

    setShowSpecsModal(false);
    setSelectedItem(null);
    setTempSpecs([]);
    setTempNotas('');
  };

  const updateCartItem = (index: number, cantidad: number) => {
    if (mesaActual === null) return;

    setMesasActivas(
      mesasActivas.map(mesa => {
        if (mesa.mesaId !== mesaActual) return mesa;

        if (cantidad <= 0) {
          const itemRemovido = mesa.cart[index];
          return {
            ...mesa,
            cart: mesa.cart.filter((_, i) => i !== index),
            total: mesa.total - (itemRemovido.precio * itemRemovido.cantidad)
          };
        } else {
          const itemAntiguo = mesa.cart[index];
          const itemNuevo = { ...itemAntiguo, cantidad };
          const diferencia = itemNuevo.precio * (cantidad - itemAntiguo.cantidad);
          return {
            ...mesa,
            cart: mesa.cart.map((c, i) => i === index ? itemNuevo : c),
            total: mesa.total + diferencia
          };
        }
      })
    );
  };

  const removeFromCart = (index: number) => {
    updateCartItem(index, 0);
  };

  const handleConfirmarPedido = async () => {
    if (mesaActual === null || carritoActual.length === 0) {
      alert('Selecciona mesa y agrega productos');
      return;
    }

    if (!mesero?.id) {
      alert('Error: No se pudo identificar al mesero');
      return;
    }

    try {
      const payload = {
        mesero_id: mesero.id,
        mesa_numero: mesaActual,
        comensales: comensalesActual,
        es_para_llevar: tipoServicioActual === 'para_llevar',
        items: carritoActual.map(item => ({
          menu_item_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          especificaciones: item.especificaciones.join(', '),
          notas: item.notas
        })),
        total: totalActual,
        estado: 'pendiente'
      };

      console.log('Enviando pedido:', payload);

      const response = await fetch('/pos/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Pedido enviado a cocina');
        
        // Limpiar carrito de la mesa
        setMesasActivas(
          mesasActivas.map(mesa =>
            mesa.mesaId === mesaActual
              ? { ...mesa, cart: [], total: 0 }
              : mesa
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        alert(`Error: ${errorData.message || 'No se pudo crear el pedido'}`);
      }
    } catch (error) {
      console.error('Error confirmando pedido:', error);
      alert('Error al confirmar pedido');
    }
  };

  const itemsFiltrados = filtroCategoria === 'Todos'
    ? menu
    : menu.filter(item => item.categoria === filtroCategoria);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  // Vista de selección de mesas
  if (mesaActual === null) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Sistema de Meseros</h1>
                  <p className="text-sm text-gray-600">Bienvenido, <span className="font-semibold">{mesero?.nombre}</span></p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/atiendemesero/finalizar')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <DollarSign className="h-5 w-5" />
                    Cobrar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <LogOut className="h-5 w-5" />
                    Salir
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mesas activas */}
          {mesasActivas.length > 0 && (
            <div className="bg-white shadow-md border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Mesas Activas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {mesasActivas.map(mesa => (
                    <button
                      key={mesa.mesaId}
                      onClick={() => cambiarMesa(mesa.mesaId)}
                      className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                      <div className="font-bold text-blue-700 text-lg">Mesa {mesa.mesaId}</div>
                      <div className="text-xs text-gray-600 mt-1">{mesa.cart.length} items</div>
                      <div className="text-sm font-semibold text-green-600 mt-1">${mesa.total.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Seleccionar nueva mesa */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecciona una Mesa</h2>
            
            {/* Lado Izquierdo */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Lado Izquierdo</h3>
              <div className="grid grid-cols-1 gap-4">
                {MESAS_CONFIG.filter(m => m.lado === 'izquierda').map(mesa => {
                  const estaActiva = mesasActivas.some(m => m.mesaId === mesa.id);
                  return (
                    <button
                      key={mesa.id}
                      onClick={() => abrirMesa(mesa)}
                      disabled={estaActiva}
                      className={`p-6 rounded-lg font-bold text-lg transition-all shadow-md ${
                        estaActiva
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-l-4 border-gray-400'
                          : 'bg-white text-gray-900 hover:shadow-lg border-l-4 border-blue-500 hover:border-blue-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl">Mesa {mesa.id}</div>
                          <div className="text-sm font-normal text-gray-600">{mesa.comensales} comensales</div>
                        </div>
                        {!estaActiva && <ChefHat className="h-8 w-8 text-blue-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lado Derecho */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Lado Derecho</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MESAS_CONFIG.filter(m => m.lado === 'derecha').map(mesa => {
                  const estaActiva = mesasActivas.some(m => m.mesaId === mesa.id);
                  return (
                    <button
                      key={mesa.id}
                      onClick={() => abrirMesa(mesa)}
                      disabled={estaActiva}
                      className={`p-6 rounded-lg font-bold text-lg transition-all shadow-md ${
                        estaActiva
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-l-4 border-gray-400'
                          : 'bg-white text-gray-900 hover:shadow-lg border-l-4 border-blue-500 hover:border-blue-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl">Mesa {mesa.id}</div>
                          <div className="text-sm font-normal text-gray-600">{mesa.comensales} comensales</div>
                        </div>
                        {!estaActiva && <ChefHat className="h-8 w-8 text-blue-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de servicio */}
        {showServicioModal && mesaTemporal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Mesa {mesaTemporal.id}
              </h2>
              <p className="text-center text-gray-600 mb-6">
                {mesaTemporal.comensales} comensales • ¿Tipo de servicio?
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => confirmarServicio(false)}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">🍽️</span>
                  <span>Comer en la Mesa</span>
                </button>
                <button
                  onClick={() => confirmarServicio(true)}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">🎁</span>
                  <span>Para Llevar</span>
                </button>
                <button
                  onClick={() => {
                    setShowServicioModal(false);
                    setMesaTemporal(null);
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Vista de especificaciones modal
  if (showSpecsModal && selectedItem) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedItem.nombre}</h2>
          <p className="text-lg text-green-600 font-bold mb-4">${selectedItem.precio.toFixed(2)}</p>
          
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Especificaciones:</p>
            <div className="space-y-2">
              {ESPECIFICACIONES_COMUNES.map((spec, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (tempSpecs.includes(spec)) {
                      setTempSpecs(tempSpecs.filter(s => s !== spec));
                    } else {
                      setTempSpecs([...tempSpecs, spec]);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all shadow-sm ${
                    tempSpecs.includes(spec)
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Notas adicionales:</p>
            <textarea
              value={tempNotas}
              onChange={(e) => setTempNotas(e.target.value)}
              placeholder="Escribir notas especiales..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={confirmarAgregacion}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
            >
              Agregar
            </button>
            <button
              onClick={() => {
                setShowSpecsModal(false);
                setSelectedItem(null);
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal de tomar pedidos
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación de mesas */}
      <div className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mesa {mesaActual}</h1>
              <p className="text-sm text-gray-600">{comensalesActual} comensales • {tipoServicioActual === 'para_llevar' ? '🎁 Para Llevar' : '🍽️ Para Comer'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <LogOut className="h-5 w-5" />
              Salir
            </button>
          </div>

          {/* Navegación de mesas */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => cambiarMesa(null)}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-sm whitespace-nowrap transition-colors shadow-sm flex items-center gap-1"
            >
              <HomeIcon className="h-4 w-4" />
              Inicio
            </button>
            <button
              onClick={() => setMostrarSeguimiento(!mostrarSeguimiento)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex items-center gap-1 transition-colors shadow-sm ${
                mostrarSeguimiento
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              📊 Pedidos ({pedidosEnSeguimiento.length})
            </button>
            {mesasActivas.map(mesa => (
              <button
                key={mesa.mesaId}
                onClick={() => cambiarMesa(mesa.mesaId)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors shadow-sm ${
                  mesa.mesaId === mesaActual
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Mesa {mesa.mesaId} ({mesa.cart.length})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtro de categorías */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorías</h3>
            <div className="flex overflow-x-auto gap-2 pb-2">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all shadow-sm ${
                    filtroCategoria === cat
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {itemsFiltrados.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all text-left border border-gray-100 hover:border-blue-300"
              >
                {item.imagen_local && (
                  <img
                    src={item.imagen_local}
                    alt={item.nombre}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                <p className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">{item.nombre}</p>
                <p className="text-base text-green-600 font-bold mt-2">${item.precio.toFixed(2)}</p>
                <button className="mt-3 w-full py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  + Agregar
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 border-l-4 border-green-500">
            <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
              <ChefHat className="h-6 w-6 text-green-600 mr-2" />
              Carrito
            </h3>

            {carritoActual.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <ChefHat className="h-16 w-16 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Carrito vacío</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                  {carritoActual.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{item.nombre}</p>
                          <p className="text-xs text-gray-500 mt-1">${item.precio.toFixed(2)}</p>
                          {item.especificaciones.length > 0 && (
                            <p className="text-xs text-blue-600 mt-2">
                              {item.especificaciones.join(', ')}
                            </p>
                          )}
                          {item.notas && (
                            <p className="text-xs text-orange-600 mt-1 italic">
                              📝 {item.notas}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-red-500 hover:text-red-700 ml-2 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateCartItem(idx, item.cantidad - 1)}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="flex-1 text-center font-bold text-base">{item.cantidad}</span>
                        <button
                          onClick={() => updateCartItem(idx, item.cantidad + 1)}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-right font-bold text-base text-green-600 mt-3">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-700 text-base">Total:</span>
                    <span className="font-bold text-2xl text-green-600">${totalActual.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmarPedido}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <ChefHat className="h-6 w-6" />
                  Enviar a Cocina
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vista de Seguimiento de Pedidos */}
      {mostrarSeguimiento && (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6 mb-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📊 Mis Pedidos
            </h2>
            <button
              onClick={() => setMostrarSeguimiento(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors border border-gray-300"
            >
              Cerrar
            </button>
          </div>

          {pedidosEnSeguimiento.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <ChefHat className="h-16 w-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay pedidos aún</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pedidosEnSeguimiento.map(pedido => {
                const estadoColor = {
                  'pendiente': 'bg-red-50 border-red-500',
                  'preparacion': 'bg-yellow-50 border-yellow-500',
                  'listo': 'bg-green-50 border-green-500',
                  'entregado': 'bg-gray-50 border-gray-500'
                };
                const estadoIcon = {
                  'pendiente': '🔴',
                  'preparacion': '🟡',
                  'listo': '✅',
                  'entregado': '✋'
                };

                return (
                  <div
                    key={pedido.id}
                    className={`p-5 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow ${estadoColor[pedido.estado as keyof typeof estadoColor] || 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xl font-bold text-gray-900">
                          {estadoIcon[pedido.estado as keyof typeof estadoIcon]} Mesa {pedido.mesa_numero}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(pedido.creado_en).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="text-sm font-bold px-2 py-1 bg-white rounded">
                        ${pedido.total.toFixed(2)}
                      </span>
                    </div>

                    {pedido.es_para_llevar && (
                      <p className="text-xs font-bold text-orange-600 mb-2">⚡ PARA LLEVAR</p>
                    )}

                    <div className="bg-white bg-opacity-60 p-2 rounded mb-2 max-h-24 overflow-y-auto">
                      {pedido.items && pedido.items.map((item: any, idx: number) => (
                        <p key={idx} className="text-xs text-gray-800">
                          {item.cantidad}x {item.nombre}
                          {item.especificaciones && (
                            <span className="text-red-600 block text-xs">🚫 {item.especificaciones}</span>
                          )}
                        </p>
                      ))}
                    </div>

                    <div className="text-sm font-bold text-center py-2 rounded bg-white">
                      {pedido.estado.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
