'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, Banknote, Smartphone, Check, AlertCircle } from 'lucide-react';
import { API, PAGES } from '@/lib/config';

interface Mesero {
  id: number;
  nombre: string;
}

interface CartItem {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  especificaciones: string;
  notas: string;
}

interface Pedido {
  id: number;
  numero_pedido: string;
  mesa_numero: number;
  comensales: number;
  es_para_llevar: boolean;
  total: number;
  estado: string;
  items: CartItem[];
  metodo_pago?: string;
}

const METODOS_PAGO = [
  { id: 'efectivo', nombre: 'Efectivo', icon: Banknote, color: 'bg-green-600' },
  { id: 'tarjeta', nombre: 'Tarjeta', icon: CreditCard, color: 'bg-blue-600' },
  { id: 'transferencia', nombre: 'Transferencia', icon: Smartphone, color: 'bg-purple-600' }
];

export default function FinalizarMesaPage() {
  const router = useRouter();
  const [mesero, setMesero] = useState<Mesero | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Pedido | null>(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [propina, setPropina] = useState('');
  const [finalizando, setFinalizando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const meseroInfo = sessionStorage.getItem('meseroInfo');
    if (!meseroInfo) {
      router.push(PAGES.MESERO_LOGIN);
      return;
    }

    const meseroData = JSON.parse(meseroInfo);
    setMesero(meseroData);
    cargarPedidos();

    // Auto-actualizar cada 5 segundos
    const interval = setInterval(cargarPedidos, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const cargarPedidos = async () => {
    try {
      const response = await fetch(`${API.PEDIDOS}?estado=listo`);
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error('Error cargando pedidos listos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularCambio = () => {
    if (!mesaSeleccionada || !montoRecibido) return 0;
    return parseFloat(montoRecibido) - mesaSeleccionada.total;
  };

  const calcularTotal = () => {
    if (!mesaSeleccionada) return 0;
    const total = mesaSeleccionada.total;
    const propinaNum = parseFloat(propina) || 0;
    return total + propinaNum;
  };

  const handleFinalizarMesa = async () => {
    if (!mesaSeleccionada) return;

    setFinalizando(true);
    try {
      // Actualizar estado del pedido a entregado
      const response = await fetch(API.PEDIDO_BY_ID(mesaSeleccionada.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'entregado',
          metodo_pago: metodoPago
        })
      });

      if (response.ok) {
        alert(`Mesa ${mesaSeleccionada.mesa_numero} finalizada correctamente`);
        setMesaSeleccionada(null);
        setMontoRecibido('');
        setPropina('');
        setMetodoPago('efectivo');
        cargarPedidos();
      }
    } catch (error) {
      console.error('Error finalizando mesa:', error);
      alert('Error al finalizar la mesa');
    } finally {
      setFinalizando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando pedidos listos...</p>
        </div>
      </div>
    );
  }

  if (!mesaSeleccionada) {
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-gray-800 text-white p-3 sm:p-4 shadow-lg border-b border-gray-700">
          <div className="w-full flex justify-between items-center">
            <button
              onClick={() => router.push(PAGES.ATIENDEMESERO)}
              className="flex items-center gap-2 hover:bg-gray-700 px-2 sm:px-3 py-2 rounded-lg transition-colors text-xs sm:text-base"
            >
              <ChevronLeft className="h-4 sm:h-5 w-4 sm:w-5" />
              Volver
            </button>
            <h1 className="font-bold text-sm sm:text-lg">Finalizar Mesas</h1>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Lista de mesas listas */}
        <div className="w-full p-3 sm:p-4 min-h-[calc(100vh-80px)]">
          {pedidos.length === 0 ? (
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 sm:p-12 text-center border border-gray-700">
              <AlertCircle className="h-8 sm:h-12 w-8 sm:w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-300 text-sm sm:text-lg">No hay mesas listas para cobrar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {pedidos.map(pedido => (
                <button
                  key={pedido.id}
                  onClick={() => setMesaSeleccionada(pedido)}
                  className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:bg-gray-750 hover:shadow-xl hover:scale-105 transition-all text-left border border-gray-700 hover:border-orange-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-white">
                        {pedido.mesa_numero}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {pedido.comensales} comensales
                      </p>
                    </div>
                    <span className="bg-green-600/20 text-green-400 px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                      Listo
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-orange-400">
                    ${pedido.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {pedido.items.length} artículos
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const cambio = calcularCambio();
  const totalConPropina = calcularTotal();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-800 text-white p-4 shadow-lg border-b border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setMesaSeleccionada(null)}
            className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            Atrás
          </button>
          <h1 className="font-bold text-lg">Mesa {mesaSeleccionada.mesa_numero}</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 pb-20 lg:pb-0">
        {/* Resumen de Orden - 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4 border border-gray-700">
            <h2 className="font-bold text-lg text-white">Resumen del Pedido</h2>

            {/* Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mesaSeleccionada.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {item.cantidad}x {item.nombre}
                    </p>
                    {item.especificaciones && (
                      <p className="text-xs text-gray-400">
                        {item.especificaciones}
                      </p>
                    )}
                    {item.notas && (
                      <p className="text-xs text-orange-400 italic">{item.notas}</p>
                    )}
                  </div>
                  <p className="font-bold text-orange-400 ml-4">
                    ${(item.precio_unitario * item.cantidad).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="border-t border-gray-600 pt-4 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span className="font-semibold">${mesaSeleccionada.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-orange-400">
                <span>Total:</span>
                <span>${mesaSeleccionada.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Cobro - 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4 sticky top-24 border border-gray-700">
            <h2 className="font-bold text-lg text-white">Cobro</h2>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Método de Pago
              </label>
              <div className="space-y-2">
                {METODOS_PAGO.map(metodo => {
                  const Icon = metodo.icon;
                  return (
                    <button
                      key={metodo.id}
                      onClick={() => setMetodoPago(metodo.id)}
                      className={`w-full p-3 rounded-lg font-semibold flex items-center gap-3 transition-all ${
                        metodoPago === metodo.id
                          ? `${metodo.color} text-white`
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {metodo.nombre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monto Recibido (solo para efectivo) */}
            {metodoPago === 'efectivo' && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Monto Recibido
                </label>
                <input
                  type="number"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-lg font-bold"
                  step="0.01"
                />
                {cambio > 0 && (
                  <p className="text-sm text-green-400 font-semibold mt-2">
                    Cambio: ${cambio.toFixed(2)}
                  </p>
                )}
                {cambio < 0 && (
                  <p className="text-sm text-red-400 font-semibold mt-2">
                    Falta: ${Math.abs(cambio).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {/* Propina */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Propina (Opcional)
              </label>
              <input
                type="number"
                value={propina}
                onChange={(e) => setPropina(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-lg font-bold"
                step="0.01"
              />
            </div>

            {/* Total Final */}
            <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-1">Total a Pagar</p>
              <p className="text-3xl font-bold text-orange-400">
                ${totalConPropina.toFixed(2)}
              </p>
            </div>

            {/* Botón Finalizar */}
            <button
              onClick={handleFinalizarMesa}
              disabled={finalizando || (metodoPago === 'efectivo' && !montoRecibido)}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              <Check className="h-6 w-6" />
              {finalizando ? 'Finalizando...' : 'Finalizar Mesa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
