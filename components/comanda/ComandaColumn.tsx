import { PedidoHeader } from './PedidoHeader';
import { ItemCheckbox } from './ItemCheckbox';
import { CompletedItemsSection } from './CompletedItemsSection';
import { ActionButton } from './ActionButton';
import { NoItemsMessage } from './NoItemsMessage';
import { ReactNode, useState, useEffect } from 'react';

interface ComandaColumnProps {
  title: string;
  count: number;
  headerIcon: React.ReactNode;
  borderColor: string;
  headerTextColor: string;
  pedidos: any[];
  noItemsIcon: React.ReactNode;
  noItemsMessage: string;
  actionButtonLabel: string;
  actionButtonIcon: React.ReactNode;
  actionButtonColor: string;
  actionButtonState: string;
  itemsCompletados: Set<string>;
  onToggleItemCompletado: (pedidoId: number, itemIndex: number) => void;
  onChangeEstado: (pedidoId: number, nuevoEstado: string) => void;
  getColorPorTiempo: (fecha: string) => string;
  getBorderColorPorTiempo: (fecha: string, baseColor: string) => string;
  getUrgencyClass: (fecha: string) => string;
  getUrgencyBgClass: (fecha: string) => string;
  getTimeTextClass: (fecha: string) => string;
  formatearTiempo: (fecha: string) => string;
  calcularTiempoTranscurrido: (fecha: string) => string;
  serverTime: Date;
  tiempoLimite: number;
  isPreparacion?: boolean;
  onViewPedido?: (pedido: any) => void;
}

export function ComandaColumn({
  title,
  count,
  headerIcon,
  borderColor,
  headerTextColor,
  pedidos,
  noItemsIcon,
  noItemsMessage,
  actionButtonLabel,
  actionButtonIcon,
  actionButtonColor,
  actionButtonState,
  itemsCompletados,
  onToggleItemCompletado,
  onChangeEstado,
  getColorPorTiempo,
  getBorderColorPorTiempo,
  getUrgencyClass,
  getUrgencyBgClass,
  getTimeTextClass,
  formatearTiempo,
  calcularTiempoTranscurrido,
  serverTime,
  tiempoLimite,
  isPreparacion = false,
  onViewPedido
}: ComandaColumnProps) {
  const [, setTick] = useState(0);

  // Forzar re-render cada segundo para actualizar el contador
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const isItemCompletado = (pedidoId: number, itemIndex: number) => {
    return itemsCompletados.has(`${pedidoId}-${itemIndex}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className={`bg-white rounded-lg shadow-md border-l-4 p-6 ${borderColor}`}>
        <h2 className={`text-3xl font-bold text-gray-900 flex items-center gap-3`}>
          {headerIcon}
          {title}
        </h2>
        <p className={`text-4xl font-bold mt-3 ${headerTextColor}`}>
          {count}
        </p>
      </div>

      {/* Pedidos */}
      <div className="space-y-4 pb-4">
        {pedidos.length > 0 ? (
          pedidos.map(pedido => {
            // Debug
            if (pedido.observaciones) {
              console.log(`Pedido ${pedido.numero_pedido} - Observaciones:`, pedido.observaciones);
            }
            
            const itemsActivos = isPreparacion
              ? pedido.items.filter((_: any, idx: number) => !isItemCompletado(pedido.id, idx))
              : pedido.items;
            const itemsCompletadosCount = isPreparacion
              ? pedido.items.filter((_: any, idx: number) => isItemCompletado(pedido.id, idx)).length
              : 0;
            
            // Obtener colores dinámicos según el tiempo
            const dynamicBgColor = getUrgencyBgClass(pedido.creado_en);
            const timeTextClass = getTimeTextClass(pedido.creado_en);
            const tiempoFormato = formatearTiempo(pedido.creado_en);

            return (
              <div 
                key={pedido.id} 
                className={`rounded-xl border-2 shadow-lg p-5 hover:shadow-2xl transition-all ${dynamicBgColor}`}
              >
                {/* Header del Pedido */}
                <PedidoHeader
                  mesa_numero={pedido.mesa_numero}
                  es_para_llevar={pedido.es_para_llevar}
                  numero_pedido={pedido.numero_pedido}
                  mesero_nombre={pedido.mesero_nombre}
                  total={pedido.total}
                  tiempo={tiempoFormato}
                  colorTiempo={getColorPorTiempo(pedido.creado_en)}
                  tiempoLimite={tiempoLimite}
                  observaciones={pedido.observaciones || ''}
                />

                {/* Items */}
                <div className="mb-3 space-y-2">
                  {isPreparacion ? (
                    <>
                      {/* Items Activos */}
                      {itemsActivos.map((item: any, idx: number) => {
                        const actualIdx = pedido.items.findIndex((i: any) => i === item);
                        return (
                          <ItemCheckbox
                            key={idx}
                            nombre={item.nombre}
                            cantidad={item.cantidad}
                            especificaciones={item.especificaciones}
                            notas={item.notas}
                            isCompleted={isItemCompletado(pedido.id, actualIdx)}
                            onClick={() => onToggleItemCompletado(pedido.id, actualIdx)}
                          />
                        );
                      })}

                      {/* Separador de completados */}
                      {itemsCompletadosCount > 0 && <CompletedItemsSection count={itemsCompletadosCount} />}

                      {/* Items Completados */}
                      {pedido.items
                        .filter((_: any, idx: number) => isItemCompletado(pedido.id, idx))
                        .map((item: any, idx: number) => {
                          const actualIdx = pedido.items.findIndex((i: any) => i === item);
                          return (
                            <ItemCheckbox
                              key={`completed-${idx}`}
                              nombre={item.nombre}
                              cantidad={item.cantidad}
                              especificaciones={item.especificaciones}
                              notas={item.notas}
                              isCompleted={true}
                              isSmall={true}
                              onClick={() => onToggleItemCompletado(pedido.id, actualIdx)}
                            />
                          );
                        })}
                    </>
                  ) : (
                    <>
                      {/* Items normales (sin checkbox) */}
                      {pedido.items.map((item: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 p-3 rounded text-sm">
                          <div className="font-bold text-gray-900 text-base">
                            {item.cantidad}x {item.nombre}
                          </div>
                          {item.notas && (
                            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-flex items-center gap-1 mt-1">
                              {item.notas}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Action Button */}
                <ActionButton
                  label={actionButtonLabel}
                  icon={actionButtonIcon}
                  onClick={() => onChangeEstado(pedido.id, actionButtonState)}
                  colorClass={actionButtonColor}
                />

                {/* Ver Detalles Button */}
                {onViewPedido && (
                  <button
                    onClick={() => onViewPedido(pedido)}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Ver Detalles
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <NoItemsMessage icon={noItemsIcon} message={noItemsMessage} />
        )}
      </div>
    </div>
  );
}
