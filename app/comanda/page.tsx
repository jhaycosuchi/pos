'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ComandaColumn } from '@/components/comanda/ComandaColumn';
import { Clock, ChefHat, Package, AlertCircle } from 'lucide-react';
import { calcularTiempoTranscurrido, calcularMinutosTranscurridos, getNowSyncedWithServer } from '@/lib/dateUtils';
import { API } from '@/lib/config';

// TIEMPO MÁXIMO PERMITIDO EN MINUTOS
const TIEMPO_LIMITE_MINUTOS = 8;

interface DetallePedido {
  nombre: string;
  cantidad: number;
  especificaciones: string;
  notas: string;
  es_restriccion: number;
}

interface Pedido {
  id: number;
  mesa_numero: number | null;
  es_para_llevar: number;
  numero_pedido: string;
  mesero_nombre: string;
  total: number;
  estado: string;
  creado_en: string;
  observaciones?: string;
  items: DetallePedido[];
}

export default function ComandaPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itemsCompletados, setItemsCompletados] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [serverTime, setServerTime] = useState<Date>(new Date());

  // Sincronizar tiempo con el servidor al montar
  useEffect(() => {
    const syncTime = async () => {
      const now = await getNowSyncedWithServer();
      setServerTime(now);
    };
    syncTime();
  }, []);

  // Actualizar serverTime cada segundo para que el contador avance
  useEffect(() => {
    const interval = setInterval(() => {
      setServerTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Cargar pedidos
  const cargarPedidos = async () => {
    try {
      const res = await fetch(API.PEDIDOS);
      const data = await res.json();
      // Debug: Mostrar observaciones
      const pedidosConObs = data?.filter((p: any) => p.observaciones) || [];
      if (pedidosConObs.length > 0) {
        console.log('✅ Pedidos con observaciones:', pedidosConObs.map((p: any) => ({numero: p.numero_pedido, obs: p.observaciones})));
      }
      setPedidos(data || []);
      if (loading) setLoading(false);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      if (loading) setLoading(false);
    }
  };

  // Auto-refresh continuo en tiempo real (cada 2 segundos)
  // Actualizar serverTime cada segundo para cálculos precisos
  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 2000);
    const timeInterval = setInterval(() => setServerTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  // Cambiar estado del pedido
  const cambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
    try {
      const res = await fetch(API.PEDIDO_BY_ID(pedidoId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        cargarPedidos();
      }
    } catch (error) {
      console.error('Error actualizando pedido:', error);
    }
  };

  // Toggle completado
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

  // Convertir segundos a formato MM:SS
  const formatearTiempo = (fecha: string): string => {
    try {
      // Usar hora local del cliente para calcular diferencia
      const ahora = new Date();
      const fechaObj = new Date(fecha.replace(' ', 'T') + 'Z');
      const diferencia = Math.floor((ahora.getTime() - fechaObj.getTime()) / 1000); // en segundos
      
      if (diferencia < 0) return '0:00';
      
      const minutos = Math.floor(diferencia / 60);
      const segundos = diferencia % 60;
      
      const resultado = `${minutos}:${segundos.toString().padStart(2, '0')}`;
      console.log(`Tiempo para ${fecha}: ${resultado} (diferencia: ${diferencia}s)`);
      return resultado;
    } catch (e) {
      console.error('Error formatearTiempo:', fecha, e);
      return '0:00';
    }
  };

  // Obtener clase de fondo COMPLETO para urgencia
  const getUrgencyBgClass = (fecha: string) => {
    const minutos = calcularMinutosTranscurridos(fecha, serverTime);
    
    // Verde: 0-4 minutos (en tiempo)
    if (minutos <= 4) return 'bg-green-50 border-green-300';
    
    // Amarillo: 5-6 minutos (advertencia)
    if (minutos <= 6) return 'bg-yellow-100 border-yellow-400';
    
    // Naranja: 7-8 minutos (urgente)
    if (minutos <= TIEMPO_LIMITE_MINUTOS) return 'bg-orange-100 border-orange-400';
    
    // Rojo pulsante: más de 8 minutos (crítico!)
    return 'bg-red-100 border-red-500 animate-pulse';
  };

  // Obtener clase de texto para el tiempo
  const getTimeTextClass = (fecha: string) => {
    const minutos = calcularMinutosTranscurridos(fecha, serverTime);
    
    if (minutos <= 4) return 'text-green-700';
    if (minutos <= 6) return 'text-yellow-700';
    if (minutos <= TIEMPO_LIMITE_MINUTOS) return 'text-orange-700';
    return 'text-red-700 font-bold animate-pulse';
  };

  // Helpers - Colores según tiempo de atraso (8 minutos máximo) - LEGACY
  const getColorPorTiempo = (fecha: string) => {
    const minutos = calcularMinutosTranscurridos(fecha, serverTime);
    
    // Verde: 0-4 minutos (50% del tiempo)
    if (minutos <= 4) return 'text-green-600';
    
    // Amarillo: 5-6 minutos (advertencia)
    if (minutos <= 6) return 'text-yellow-600';
    
    // Naranja: 7-8 minutos (casi al límite)
    if (minutos <= TIEMPO_LIMITE_MINUTOS) return 'text-orange-600';
    
    // Rojo: más de 8 minutos (retrasado!)
    return 'text-red-600';
  };

  // Obtener color de fondo para la tarjeta según el tiempo - LEGACY
  const getBorderColorPorTiempo = (fecha: string, baseColor: string) => {
    const minutos = calcularMinutosTranscurridos(fecha, serverTime);
    
    // Si está en tiempo, usar el color base de la columna
    if (minutos <= 4) return baseColor;
    
    // Amarillo: 5-6 minutos
    if (minutos <= 6) return 'border-yellow-500';
    
    // Naranja: 7-8 minutos
    if (minutos <= TIEMPO_LIMITE_MINUTOS) return 'border-orange-500';
    
    // Rojo pulsante: más de 8 minutos
    return 'border-red-600';
  };

  // Obtener clase de fondo para urgencia - LEGACY
  const getUrgencyClass = (fecha: string) => {
    const minutos = calcularMinutosTranscurridos(fecha, serverTime);
    
    if (minutos <= 4) return '';
    if (minutos <= 6) return 'bg-yellow-50';
    if (minutos <= TIEMPO_LIMITE_MINUTOS) return 'bg-orange-50';
    return 'bg-red-50 animate-pulse';
  };

  // Preparar datos por estado, ordenados de más viejo a más nuevo
  const pedidosPendientes = pedidos
    .filter(p => p.estado === 'pendiente')
    .sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime());
  
  const pedidosPreparacion = pedidos
    .filter(p => p.estado === 'preparando')
    .sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime());
  
  const pedidosListos = pedidos
    .filter(p => p.estado === 'listo')
    .sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime());


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-3 md:p-4 lg:p-6">
      <div className="w-full">
        {/* Header con Logo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-8 bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
          <Image
            src="/comanda/logo.svg"
            alt="Mazuhi Logo"
            width={80}
            height={80}
            className="object-contain sm:w-[100px] md:w-[120px]"
          />
          <div className="text-left sm:text-right">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">COMANDA</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">En tiempo real • Automático</p>
          </div>
        </div>

        {/* Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-8">
          {/* PENDIENTES */}
          <ComandaColumn
            title="PENDIENTES"
            count={pedidosPendientes.length}
            headerIcon={<AlertCircle className="h-8 w-8 text-red-600" />}
            borderColor="border-red-600"
            headerTextColor="text-red-600"
            pedidos={pedidosPendientes}
            noItemsIcon={<AlertCircle className="h-12 w-12 text-gray-300" />}
            noItemsMessage="No hay pedidos pendientes"
            actionButtonLabel="Comenzar"
            actionButtonIcon={<ChefHat className="h-6 w-6" />}
            actionButtonColor="bg-yellow-500 hover:bg-yellow-600"
            actionButtonState="preparando"
            itemsCompletados={itemsCompletados}
            onToggleItemCompletado={toggleItemCompletado}
            onChangeEstado={cambiarEstado}
            getColorPorTiempo={getColorPorTiempo}
            getBorderColorPorTiempo={getBorderColorPorTiempo}
            getUrgencyClass={getUrgencyClass}
            getUrgencyBgClass={getUrgencyBgClass}
            getTimeTextClass={getTimeTextClass}
            formatearTiempo={formatearTiempo}
            calcularTiempoTranscurrido={calcularTiempoTranscurrido}
            serverTime={serverTime}
            tiempoLimite={TIEMPO_LIMITE_MINUTOS}
            isPreparacion={false}
          />

          {/* EN PREPARACIÓN */}
          <ComandaColumn
            title="EN PREPARACIÓN"
            count={pedidosPreparacion.length}
            headerIcon={<ChefHat className="h-8 w-8 text-yellow-600" />}
            borderColor="border-yellow-600"
            headerTextColor="text-yellow-600"
            pedidos={pedidosPreparacion}
            noItemsIcon={<ChefHat className="h-12 w-12 text-gray-300" />}
            noItemsMessage="No hay pedidos en preparación"
            actionButtonLabel="Completar"
            actionButtonIcon={<Package className="h-6 w-6" />}
            actionButtonColor="bg-green-600 hover:bg-green-700"
            actionButtonState="listo"
            itemsCompletados={itemsCompletados}
            onToggleItemCompletado={toggleItemCompletado}
            onChangeEstado={cambiarEstado}
            getColorPorTiempo={getColorPorTiempo}
            getBorderColorPorTiempo={getBorderColorPorTiempo}
            getUrgencyClass={getUrgencyClass}
            getUrgencyBgClass={getUrgencyBgClass}
            getTimeTextClass={getTimeTextClass}
            formatearTiempo={formatearTiempo}
            calcularTiempoTranscurrido={calcularTiempoTranscurrido}
            serverTime={serverTime}
            tiempoLimite={TIEMPO_LIMITE_MINUTOS}
            isPreparacion={true}
          />

          {/* LISTOS */}
          <ComandaColumn
            title="LISTOS"
            count={pedidosListos.length}
            headerIcon={<Package className="h-8 w-8 text-green-600" />}
            borderColor="border-green-600"
            headerTextColor="text-green-600"
            pedidos={pedidosListos}
            noItemsIcon={<Package className="h-12 w-12 text-gray-300" />}
            noItemsMessage="No hay pedidos listos"
            actionButtonLabel="Entregado"
            actionButtonIcon={<AlertCircle className="h-6 w-6" />}
            actionButtonColor="bg-gray-700 hover:bg-gray-800"
            actionButtonState="entregado"
            itemsCompletados={itemsCompletados}
            onToggleItemCompletado={toggleItemCompletado}
            onChangeEstado={cambiarEstado}
            getColorPorTiempo={getColorPorTiempo}
            getBorderColorPorTiempo={getBorderColorPorTiempo}
            getUrgencyClass={getUrgencyClass}
            getUrgencyBgClass={getUrgencyBgClass}
            getTimeTextClass={getTimeTextClass}
            formatearTiempo={formatearTiempo}
            calcularTiempoTranscurrido={calcularTiempoTranscurrido}
            serverTime={serverTime}
            tiempoLimite={TIEMPO_LIMITE_MINUTOS}
            isPreparacion={false}
          />
        </div>
      </div>
    </div>
  );
}
