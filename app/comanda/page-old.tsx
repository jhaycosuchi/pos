'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock, AlertCircle, ChefHat, Utensils, Timer, Users, X, Check, Package, Flame } from 'lucide-react';

interface PedidoComanda {
  id: number;
  numero_pedido: string;
  mesa_numero: number;
  mesero_nombre: string;
  estado: string;
  es_para_llevar: boolean;
  creado_en: string;
  total: number;
  items: Array<{
    nombre: string;
    cantidad: number;
    especificaciones: string;
    notas: string;
    precio_unitario: number;
    subtotal: number;
  }>;
}

interface ItemCompletado {
  pedidoId: number;
  itemIndex: number;
}

export default function ComandaPage() {
  const [pedidos, setPedidos] = useState<PedidoComanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [itemsCompletados, setItemsCompletados] = useState<Set<string>>(new Set());

  useEffect(() => {
    cargarPedidos();

    if (autoRefresh) {
      const interval = setInterval(cargarPedidos, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const cargarPedidos = async () => {
    try {
      const response = await fetch('/pos/api/pedidos?estado=pendiente,preparando,listo');
      if (response.ok) {
        const data = await response.json();
        setPedidos(data.sort((a: PedidoComanda, b: PedidoComanda) => {
          const estadoOrden = { pendiente: 0, preparando: 1, listo: 2 };
          const ordenA = estadoOrden[a.estado as keyof typeof estadoOrden] ?? 99;
          const ordenB = estadoOrden[b.estado as keyof typeof estadoOrden] ?? 99;
          if (ordenA !== ordenB) {
            return ordenA - ordenB;
          }
          return new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime();
        }));
      } else {
        console.error('Error en respuesta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
    try {
      console.log(`Cambiando estado del pedido ${pedidoId} a ${nuevoEstado}`);
      
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        // Actualizar localmente primero para feedback rápido
        setPedidos(pedidos.map(p => 
          p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
        ).sort((a: PedidoComanda, b: PedidoComanda) => {
          const estadoOrden = { pendiente: 0, preparando: 1, listo: 2 };
          const ordenA = estadoOrden[a.estado as keyof typeof estadoOrden] ?? 99;
          const ordenB = estadoOrden[b.estado as keyof typeof estadoOrden] ?? 99;
          if (ordenA !== ordenB) {
            return ordenA - ordenB;
          }
          return new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime();
        }));
        
        // Recargar después de un momento para asegurar consistencia
        setTimeout(() => {
          cargarPedidos();
        }, 1000);
      } else {
        const errorText = await response.text();
        console.error('Error en respuesta:', response.status, errorText);
        alert('Error al actualizar el estado del pedido');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error de conexión al actualizar el estado');
    }
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTiempoTranscurrido = (fecha: string) => {
    const ahora = new Date().getTime();
    const creado = new Date(fecha).getTime();
    const minutos = Math.floor((ahora - creado) / 60000);
    if (minutos < 1) return 'Nuevo';
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}h ${minutosRestantes}m`;
  };

  const getColorPorTiempo = (fecha: string) => {
    const minutos = Math.floor((new Date().getTime() - new Date(fecha).getTime()) / 60000);
    if (minutos > 30) return 'text-red-500 animate-pulse';
    if (minutos > 15) return 'text-yellow-500';
    return 'text-green-500';
  };

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosEnPreparacion = pedidos.filter(p => p.estado === 'preparando');
  const pedidosListos = pedidos.filter(p => p.estado === 'listo');

  const toggleItemCompletado = (pedidoId: number, itemIndex: number) => {
    const key = `${pedidoId}-${itemIndex}`;
    const newSet = new Set(itemsCompletados);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setItemsCompletados(newSet);
  };

  const isItemCompletado = (pedidoId: number, itemIndex: number) => {
    return itemsCompletados.has(`${pedidoId}-${itemIndex}`);
  };

  const TiraPedido = ({ pedido, colorClass, statusIcon }: any) => (
    <div className={`${colorClass} rounded-2xl p-6 shadow-2xl border-l-8 h-full flex flex-col transition-all duration-300 hover:shadow-3xl`}>
      {/* Header */}
      <div className="mb-4 pb-4 border-b-2 border-gray-300">
        <div className="flex items-center justify-between mb-2">
          <div className="text-4xl">{statusIcon}</div>
          <span className={`text-3xl font-bold ${getColorPorTiempo(pedido.creado_en)}`}>
            {calcularTiempoTranscurrido(pedido.creado_en)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          {pedido.es_para_llevar ? (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              🥡 LLEVAR
            </span>
          ) : (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              🍽️ MESA {pedido.mesa_numero}
            </span>
          )}
          <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {pedido.numero_pedido}
          </span>
        </div>

        <h3 className="text-2xl font-black text-gray-900">
          {pedido.es_para_llevar ? 'PARA LLEVAR' : `MESA ${pedido.mesa_numero}`}
        </h3>
        <p className="text-sm text-gray-600">👤 {pedido.mesero_nombre}</p>
        <p className="text-sm text-green-700 font-bold">💰 ${pedido.total?.toFixed(2) || '0.00'}</p>
      </div>

      {/* Items List - Scrollable */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2">
        {(pedido.items || []).map((item: any, idx: number) => {
          const isCompleted = isItemCompletado(pedido.id, idx);
          return (
            <button
              key={idx}
              onClick={() => toggleItemCompletado(pedido.id, idx)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                isCompleted
                  ? 'bg-green-100 border-green-400 opacity-50'
                  : 'bg-white border-gray-300 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`flex-shrink-0 mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500 border-green-600'
                    : 'border-gray-400'
                }`}>
                  {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-lg ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.cantidad}x {item.nombre}
                  </div>

                  {item.especificaciones && (
                    <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block mt-1 mr-1">
                      🚫 {item.especificaciones}
                    </div>
                  )}

                  {item.notas && (
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mt-1">
                      📝 {item.notas}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      <button
        onClick={() => cambiarEstado(pedido.id, 'preparando')}
        className="w-full font-bold py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 text-base"
      >
        <ChefHat className="h-5 w-5" />
        INICIAR COCINA
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900">COMANDA DIGITAL</h1>
              <p className="text-gray-600 text-xl mt-2">
                Sistema de cocina en tiempo real
              </p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-8 py-4 rounded-lg font-bold flex items-center gap-3 transition-colors text-lg ${
                  autoRefresh
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RefreshCw className={`h-6 w-6 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </button>
              <button
                onClick={cargarPedidos}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-3 hover:bg-blue-700 transition-colors text-lg"
              >
                <RefreshCw className="h-6 w-6" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mb-4"></div>
          <p className="text-white text-xl font-bold">Cargando pedidos...</p>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto">
          {/* 3 Columnas - Tiras */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Columna 1: PENDIENTES */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-md border-l-4 border-red-600 p-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🔴 PENDIENTES
                </h2>
                <p className="text-3xl font-bold text-red-600 mt-1">{pedidosPendientes.length}</p>
              </div>

              <div className="space-y-3 pb-4">
                {pedidosPendientes.length > 0 ? (
                  pedidosPendientes.map(pedido => (
                    <div key={pedido.id} className="bg-white rounded-lg shadow-md border-l-4 border-red-500 p-4 hover:shadow-lg transition-shadow">
                      {/* Header Compacto */}
                      <div className="mb-2 pb-2 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-lg font-bold ${getColorPorTiempo(pedido.creado_en)}`}>
                            {calcularTiempoTranscurrido(pedido.creado_en)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {pedido.es_para_llevar ? (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                              🥡 LLEVAR
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                              🍽️ MESA {pedido.mesa_numero}
                            </span>
                          )}
                          <span className="text-xs font-mono text-gray-600">
                            {pedido.numero_pedido}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900">
                          {pedido.es_para_llevar ? 'PARA LLEVAR' : `MESA ${pedido.mesa_numero}`}
                        </h3>
                        <p className="text-xs text-gray-600">👤 {pedido.mesero_nombre}</p>
                        <p className="text-xs font-bold text-green-700">💰 ${pedido.total?.toFixed(2) || '0.00'}</p>
                      </div>

                      {/* Items List */}
                      <div className="max-h-40 overflow-y-auto mb-2 space-y-1 pr-1">
                        {(pedido.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 border border-gray-200 p-2 rounded text-xs">
                            <div className="font-semibold text-gray-900">
                              {item.cantidad}x {item.nombre}
                            </div>
                            {(item.especificaciones || item.notas) && (
                              <div className="mt-0.5 flex gap-1 flex-wrap">
                                {item.especificaciones && (
                                  <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded inline-block text-xs">
                                    🚫 {item.especificaciones}
                                  </span>
                                )}
                                {item.notas && (
                                  <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded inline-block text-xs">
                                    📝 {item.notas}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'preparando')}
                        className="w-full font-semibold py-2 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <ChefHat className="h-4 w-4" />
                        INICIAR COCINA
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Sin pedidos pendientes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna 2: EN PREPARACION */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-md border-l-4 border-yellow-600 p-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🟡 EN PREPARACIÓN
                </h2>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pedidosEnPreparacion.length}</p>
              </div>

              <div className="space-y-4 pb-4">
                {pedidosEnPreparacion.length > 0 ? (
                  pedidosEnPreparacion.map(pedido => {
                    // Separar items completados de pendientes
                    const itemsActivos = pedido.items.filter((_: any, idx: number) => !isItemCompletado(pedido.id, idx));
                    const itemsCompletados = pedido.items.filter((_: any, idx: number) => isItemCompletado(pedido.id, idx));
                    
                    return (
                      <div key={pedido.id} className="bg-white rounded-lg shadow-md border-l-4 border-yellow-500 p-4 hover:shadow-lg transition-shadow">
                        {/* Header */}
                        <div className="mb-2 pb-2 border-b border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-lg font-bold ${getColorPorTiempo(pedido.creado_en)}`}>
                              {calcularTiempoTranscurrido(pedido.creado_en)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {pedido.es_para_llevar ? (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                                🥡 LLEVAR
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                🍽️ MESA {pedido.mesa_numero}
                              </span>
                            )}
                            <span className="text-xs font-mono text-gray-600">
                              {pedido.numero_pedido}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-gray-900">
                            {pedido.es_para_llevar ? 'PARA LLEVAR' : `MESA ${pedido.mesa_numero}`}
                          </h3>
                          <p className="text-xs text-gray-600">👤 {pedido.mesero_nombre}</p>
                          <p className="text-xs font-bold text-green-700">💰 ${pedido.total?.toFixed(2) || '0.00'}</p>
                        </div>

                        {/* Items Activos - Arriba */}
                        <div className="mb-2 space-y-1">
                          {itemsActivos.map((item: any, idx: number) => {
                            const actualIdx = pedido.items.findIndex((i: any) => i === item);
                            return (
                              <button
                                key={idx}
                                onClick={() => toggleItemCompletado(pedido.id, actualIdx)}
                                className="w-full text-left p-2 rounded-lg border border-yellow-300 bg-white hover:bg-yellow-50 transition-colors"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded border border-gray-400 bg-white"></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 text-sm">
                                      {item.cantidad}x {item.nombre}
                                    </div>
                                    {(item.especificaciones || item.notas) && (
                                      <div className="mt-0.5 flex gap-1 flex-wrap">
                                        {item.especificaciones && (
                                          <span className="bg-red-50 text-red-700 px-1 py-0.5 rounded inline-block text-xs">
                                            🚫 {item.especificaciones}
                                          </span>
                                        )}
                                        {item.notas && (
                                          <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded inline-block text-xs">
                                            📝 {item.notas}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Separador si hay items completados */}
                        {itemsCompletados.length > 0 && (
                          <div className="my-2 py-1 border-t border-dashed border-gray-300 text-center text-xs text-gray-500 font-semibold">
                            ✅ COMPLETADOS ({itemsCompletados.length})
                          </div>
                        )}

                        {/* Items Completados - Abajo, grisados */}
                        {itemsCompletados.length > 0 && (
                          <div className="mb-2 space-y-1 opacity-50">
                            {itemsCompletados.map((item: any, idx: number) => {
                              const actualIdx = pedido.items.findIndex((i: any) => i === item);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => toggleItemCompletado(pedido.id, actualIdx)}
                                  className="w-full text-left p-2 rounded-lg border border-green-300 bg-green-50 transition-colors"
                                >
                                  <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-gray-600 text-sm line-through">
                                        {item.cantidad}x {item.nombre}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Action Button */}
                        <button
                          onClick={() => cambiarEstado(pedido.id, 'listo')}
                          className="w-full font-semibold py-2 px-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          MARCAR LISTO
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Sin pedidos en cocina</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna 3: LISTOS */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-md border-l-4 border-green-600 p-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🟢 LISTOS
                </h2>
                <p className="text-3xl font-bold text-green-600 mt-1">{pedidosListos.length}</p>
              </div>

              <div className="space-y-4 pb-4">
                {pedidosListos.length > 0 ? (
                  pedidosListos.map(pedido => (
                    <div key={pedido.id} className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-4 hover:shadow-lg transition-shadow">
                      {/* Header */}
                      <div className="mb-2 pb-2 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg font-bold text-green-600">
                            {calcularTiempoTranscurrido(pedido.creado_en)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {pedido.es_para_llevar ? (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                              🥡 LLEVAR
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                              🍽️ MESA {pedido.mesa_numero}
                            </span>
                          )}
                          <span className="text-xs font-mono text-gray-600">
                            {pedido.numero_pedido}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900">
                          {pedido.es_para_llevar ? 'PARA LLEVAR' : `MESA ${pedido.mesa_numero}`}
                        </h3>
                        <p className="text-xs text-gray-600">👤 {pedido.mesero_nombre}</p>
                        <p className="text-xs font-bold text-green-700">💰 ${pedido.total?.toFixed(2) || '0.00'}</p>
                      </div>

                      {/* Items List */}
                      <div className="mb-2 space-y-1">
                        {(pedido.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="bg-green-50 border border-green-200 p-2 rounded text-xs">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                  {item.cantidad}x {item.nombre}
                                </div>
                                {item.notas && (
                                  <div className="text-xs bg-blue-50 text-blue-700 px-1 py-0.5 rounded inline-block mt-0.5">
                                    📝 {item.notas}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'entregado')}
                        className="w-full font-semibold py-2 px-3 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Utensils className="h-4 w-4" />
                        ENTREGADO
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Sin pedidos listos</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Empty State */}
          {pedidosPendientes.length === 0 && pedidosEnPreparacion.length === 0 && pedidosListos.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center border-l-4 border-green-600">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Cocina al día!</h3>
              <p className="text-gray-600">No hay pedidos en este momento</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}