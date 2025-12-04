import { Package, Utensils, Clock, AlertTriangle } from 'lucide-react';

interface PedidoHeaderProps {
  mesa_numero?: number;
  es_para_llevar: boolean;
  numero_pedido: string;
  mesero_nombre: string;
  total: number;
  tiempo: string;
  colorTiempo: string;
  tiempoLimite?: number;
}

export function PedidoHeader({
  mesa_numero,
  es_para_llevar,
  numero_pedido,
  mesero_nombre,
  total,
  tiempo,
  colorTiempo,
  tiempoLimite = 8
}: PedidoHeaderProps) {
  const tiempoDisplay = tiempo && tiempo !== '' ? tiempo : 'recién';
  
  // Determinar si está en estado crítico (rojo)
  const isCritical = colorTiempo.includes('red');
  const isWarning = colorTiempo.includes('orange') || colorTiempo.includes('yellow');
  
  // Calcular clase de fondo para el tiempo
  const tiempoBgClass = isCritical 
    ? 'bg-red-100 border-2 border-red-500' 
    : isWarning 
      ? 'bg-yellow-100 border-2 border-yellow-500' 
      : 'bg-green-50 border border-green-300';
  
  return (
    <div className="mb-3 pb-3 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-lg font-bold ${colorTiempo} ${tiempoBgClass} px-3 py-2 rounded-lg flex items-center gap-2`}>
          {isCritical ? (
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
          <span className={isCritical ? 'animate-pulse' : ''}>
            ⏱️ {tiempoDisplay}
          </span>
          {isCritical && (
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full ml-1">
              ¡URGENTE!
            </span>
          )}
        </span>
        {isWarning && !isCritical && (
          <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
            ⚠️ Apúrate
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {es_para_llevar ? (
          <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1">
            <Package className="h-4 w-4" /> 🛍️ LLEVAR
          </span>
        ) : (
          <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1">
            <Utensils className="h-4 w-4" /> 🍽️ MESA {mesa_numero}
          </span>
        )}
        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
          #{numero_pedido}
        </span>
      </div>

      <h3 className="text-2xl font-bold text-gray-900">
        {es_para_llevar ? '🛍️ PARA LLEVAR' : `🍽️ MESA ${mesa_numero}`}
      </h3>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-gray-600 font-semibold">👨‍🍳 {mesero_nombre}</p>
        <p className="text-lg font-bold text-green-700">💵 ${(total || 0).toFixed(2)}</p>
      </div>
    </div>
  );
}
