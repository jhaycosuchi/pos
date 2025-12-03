'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ComandaColumn } from '@/components/comanda/ComandaColumn';
import { Clock, ChefHat, Package, AlertCircle } from 'lucide-react';
import { calcularTiempoTranscurrido, calcularMinutosTranscurridos } from '@/lib/dateUtils';
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
  items: DetallePedido[];
}

export default function ComandaPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itemsCompletados, setItemsCompletados] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Cargar pedidos
  const cargarPedidos = async () => {
    try {
      const res = await fetch(API.PEDIDOS);
      const data = await res.json();
      setPedidos(data || []);
      if (loading) setLoading(false);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      if (loading) setLoading(false);
    }
  };

  // Auto-refresh continuo en tiempo real (cada 2 segundos)
  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 2000);
    return () => clearInterval(interval);
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

  // Helpers - Colores según tiempo de atraso (8 minutos máximo)
  const getColorPorTiempo = (fecha: string) => {
    const minutos = calcularMinutosTranscurridos(fecha);
    
    // Verde: 0-4 minutos (50% del tiempo)
    if (minutos <= 4) return 'text-green-600';
    
    // Amarillo: 5-6 minutos (advertencia)
    if (minutos <= 6) return 'text-yellow-600';
    
    // Naranja: 7-8 minutos (casi al límite)
    if (minutos <= TIEMPO_LIMITE_MINUTOS) return 'text-orange-600';
    
    // Rojo: más de 8 minutos (retrasado!)
    return 'text-red-600';
  };

  // Obtener color de fondo para la tarjeta según el tiempo
  const getBorderColorPorTiempo = (fecha: string, baseColor: string) => {
    const minutos = calcularMinutosTranscurridos(fecha);
    
    // Si está en tiempo, usar el color base de la columna
    if (minutos <= 4) return baseColor;
    
    // Amarillo: 5-6 minutos
    if (minutos <= 6) return 'border-yellow-500';
    
    // Naranja: 7-8 minutos
    if (minutos <= TIEMPO_LIMITE_MINUTOS) return 'border-orange-500';
    
    // Rojo pulsante: más de 8 minutos
    return 'border-red-600';
  };

  // Obtener clase de fondo para urgencia
  const getUrgencyClass = (fecha: string) => {
    const minutos = calcularMinutosTranscurridos(fecha);
    
    if (minutos <= 4) return '';
    if (minutos <= 6) return 'bg-yellow-50';
    if (minutos <= TIEMPO_LIMITE_MINUTOS) return 'bg-orange-50';
    return 'bg-red-50 animate-pulse';
  };

  // Preparar datos por estado
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosPreparacion = pedidos.filter(p => p.estado === 'preparando');
  const pedidosListos = pedidos.filter(p => p.estado === 'listo');


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con Logo */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-md">
          <Image
            src="/comanda/logo.svg"
            alt="Mazuhi Logo"
            width={120}
            height={120}
            className="object-contain"
          />
          <div className="text-right">
            <h1 className="text-4xl font-bold text-primary">COMANDA DIGITAL</h1>
            <p className="text-gray-600 mt-1">En tiempo real • Actualizando automáticamente</p>
          </div>
        </div>

        {/* Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
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
            calcularTiempoTranscurrido={calcularTiempoTranscurrido}
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
            calcularTiempoTranscurrido={calcularTiempoTranscurrido}
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
            calcularTiempoTranscurrido={calcularTiempoTranscurrido}
            tiempoLimite={TIEMPO_LIMITE_MINUTOS}
            isPreparacion={false}
          />
        </div>
      </div>
    </div>
  );
}
