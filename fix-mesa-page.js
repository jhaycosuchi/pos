const fs = require('fs');
const path = require('path');

const code = `'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Minus, X, Utensils, ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  imagen_local?: string;
  descripcion?: string;
}

interface CartItem {
  id: string;
  menu_item_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  especificaciones: string;
  notas: string;
}

interface MenuCategory {
  nombre: string;
  items: MenuItem[];
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

export default function MesaPage() {
  const params = useParams();
  const router = useRouter();
  const mesaId = params.id as string;
  
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [tempSpecs, setTempSpecs] = useState<string[]>([]);
  const [tempNotas, setTempNotas] = useState('');
  const [tipoServicio, setTipoServicio] = useState<'para_comer' | 'para_llevar' | null>(null);
  const [showTipoModal, setShowTipoModal] = useState(true);
  const [mesero, setMesero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const meseroInfo = sessionStorage.getItem('meseroInfo');
    if (meseroInfo) {
      setMesero(JSON.parse(meseroInfo));
    }
    cargarMenu();
  }, []);

  const cargarMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenu(data || []);
        if (data.length > 0 && !filtroCategoria) {
          setFiltroCategoria(data[0].nombre);
        }
      }
    } catch (error) {
      console.error('Error al cargar menú:', error);
    } finally {
      setLoading(false);
    }
  };

  const itemsFiltrados = filtroCategoria
    ? menu.find(cat => cat.nombre === filtroCategoria)?.items || []
    : menu[0]?.items || [];

  const addToCart = (item: MenuItem) => {
    setSelectedItem(item);
    setTempSpecs([]);
    setTempNotas('');
    setShowSpecsModal(true);
  };

  const confirmarAgregacion = () => {
    if (!selectedItem) return;

    const especificacionesStr = tempSpecs.length > 0 ? tempSpecs.join(', ') : 'Normal';

    const newItem: CartItem = {
      id: \`\${selectedItem.id}-\${Date.now()}\`,
      menu_item_id: selectedItem.id,
      nombre: selectedItem.nombre,
      precio: selectedItem.precio,
      cantidad: 1,
      especificaciones: especificacionesStr,
      notas: tempNotas
    };

    setCart([...cart, newItem]);
    setShowSpecsModal(false);
    setSelectedItem(null);
    setTempSpecs([]);
    setTempNotas('');
  };

  const updateCartItem = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => item.id === id ? {...item, cantidad} : item));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const handleConfirmarPedido = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!tipoServicio) {
      alert('Selecciona el tipo de servicio');
      return;
    }

    if (!mesero) {
      alert('No se encontró información del mesero');
      return;
    }

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesero_id: mesero.id,
          mesa_numero: parseInt(mesaId),
          comensales: getComensales(parseInt(mesaId)),
          es_para_llevar: tipoServicio === 'para_llevar',
          items: cart.map(item => ({
            menu_item_id: item.menu_item_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            especificaciones: item.especificaciones,
            notas: item.notas
          }))
        })
      });

      if (response.ok) {
        alert('Pedido enviado a cocina');
        setCart([]);
        router.push('/atiendemesero');
      } else {
        alert('Error al enviar pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar pedido');
    }
  };

  const getComensales = (mesa: number) => {
    const comensales: Record<number, number> = { 1: 5, 2: 3, 3: 6, 4: 5, 5: 5, 6: 5 };
    return comensales[mesa] || 4;
  };

  if (showTipoModal && !tipoServicio) {
    return (
      <div className="fixed inset-0 bg-primary flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-10 shadow-2xl">
          <h2 className="text-4xl font-bold text-primary mb-3 text-center">
            Mesa {mesaId}
          </h2>
          <p className="text-center text-dark text-xl mb-8 font-medium">
            {getComensales(parseInt(mesaId))} personas
          </p>
          <p className="text-center text-dark text-2xl font-semibold mb-6">
            ¿Tipo de servicio?
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                setTipoServicio('para_comer');
                setShowTipoModal(false);
              }}
              className="w-full py-6 bg-secondary hover:bg-blue-600 text-white font-bold text-2xl rounded-lg transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-3"
            >
              <Utensils className="h-8 w-8" />
              Para Comer Aquí
            </button>
            <button
              onClick={() => {
                setTipoServicio('para_llevar');
                setShowTipoModal(false);
              }}
              className="w-full py-6 bg-accent hover:bg-yellow-600 text-white font-bold text-2xl rounded-lg transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-3"
            >
              <ShoppingCart className="h-8 w-8" />
              Para Llevar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-dark">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-primary shadow-lg border-b-4 border-secondary sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/atiendemesero"
                className="bg-secondary hover:bg-blue-600 p-3 rounded-lg transition text-white"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Mesa {mesaId}</h1>
                <p className="text-lg text-blue-100">
                  {getComensales(parseInt(mesaId))} personas • {tipoServicio === 'para_llevar' ? 'Para Llevar' : 'Para Comer'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg text-blue-100">Total</p>
              <p className="text-4xl font-bold text-success">\${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menú - 2 columnas */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selector de categoría */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-secondary">
            <div className="flex flex-wrap gap-2">
              {menu.map((category) => (
                <button
                  key={category.nombre}
                  onClick={() => setFiltroCategoria(category.nombre)}
                  className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                    filtroCategoria === category.nombre
                      ? 'bg-primary text-white'
                      : 'bg-light text-dark hover:bg-gray-200'
                  }\`}
                >
                  {category.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de productos */}
          {filtroCategoria && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-light border-b-2 border-secondary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-primary uppercase">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-primary uppercase">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {itemsFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.imagen_local && (
                              <img
                                src={item.imagen_local}
                                alt={item.nombre}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-dark">{item.nombre}</p>
                              {item.descripcion && (
                                <p className="text-sm text-dark max-w-xs truncate">{item.descripcion}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-bold text-lg text-success">\${item.precio.toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-secondary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 inline-flex items-center gap-2"
                          >
                            <Plus className="h-5 w-5" />
                            Agregar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Carrito - 1 columna */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 border-l-4 border-success">
            <h3 className="font-bold text-2xl text-primary mb-4 flex items-center">
              <ShoppingCart className="h-8 w-8 text-secondary mr-2" />
              Carrito
            </h3>

            {cart.length === 0 ? (
              <div className="text-center text-dark py-8">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">Carrito vacío</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-light p-4 rounded-lg border-2 border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-base text-dark">{item.nombre}</p>
                          <p className="text-sm text-dark">\${item.precio.toFixed(2)} c/u</p>
                          {item.especificaciones && item.especificaciones !== 'Normal' && (
                            <p className="text-sm text-secondary mt-1 font-semibold">
                              {item.especificaciones}
                            </p>
                          )}
                          {item.notas && (
                            <p className="text-sm text-accent mt-1 italic">
                              {item.notas}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-error hover:text-red-700 ml-2"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateCartItem(item.id, item.cantidad - 1)}
                          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded-lg text-lg font-bold"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="flex-1 text-center font-bold">{item.cantidad}</span>
                        <button
                          onClick={() => updateCartItem(item.id, item.cantidad + 1)}
                          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded-lg text-lg font-bold"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-right font-bold text-success mt-2">
                        \${(item.precio * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-gray-300 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl text-dark">Total:</span>
                    <span className="font-bold text-2xl text-success">\${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmarPedido}
                  className="w-full py-4 bg-success hover:bg-green-600 text-white font-bold text-lg rounded-lg transition-all shadow-xl hover:scale-105"
                >
                  Enviar a Cocina
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Especificaciones */}
      {showSpecsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-3xl font-bold text-dark mb-2">{selectedItem.nombre}</h2>
            <p className="text-3xl text-success font-bold mb-6">\${selectedItem.precio.toFixed(2)}</p>
            
            <div className="mb-6">
              <p className="text-xl font-bold text-primary mb-4">Especificaciones:</p>
              <div className="grid grid-cols-2 gap-3">
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
                    className={\`py-4 px-5 rounded-lg text-base font-semibold transition-all shadow-md \${
                      tempSpecs.includes(spec)
                        ? 'bg-secondary text-white scale-105'
                        : 'bg-light text-dark hover:bg-gray-200'
                    }\`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xl font-bold text-primary mb-3">Notas adicionales:</p>
              <textarea
                value={tempNotas}
                onChange={(e) => setTempNotas(e.target.value)}
                placeholder="Ej: Sin cebolla, extra salsa..."
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg text-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={confirmarAgregacion}
                className="py-5 bg-success hover:bg-green-600 text-white font-bold text-xl rounded-lg transition-all shadow-xl hover:scale-105"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setShowSpecsModal(false);
                  setSelectedItem(null);
                }}
                className="py-5 bg-gray-300 text-dark font-bold text-xl rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

fs.writeFileSync('app/atiendemesero/mesa/[id]/page.tsx', code, 'utf8');
console.log('✅ mesa/[id]/page.tsx recreated successfully!');
