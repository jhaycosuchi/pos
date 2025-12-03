import { Package, Utensils, AlertCircle, X } from 'lucide-react';

interface PedidoItemProps {
  nombre: string;
  cantidad: number;
  especificaciones?: string;
  notas?: string;
}

export function PedidoItem({ nombre, cantidad, especificaciones, notas }: PedidoItemProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 p-3 rounded text-sm">
      <div className="font-bold text-gray-900 text-base">
        {cantidad}x {nombre}
      </div>
      {(especificaciones || notas) && (
        <div className="mt-1 flex gap-1 flex-wrap">
          {especificaciones && (
            <span className="bg-red-50 text-red-700 px-2 py-1 rounded inline-flex items-center gap-1 text-xs font-semibold">
              <X className="h-3 w-3" /> {especificaciones}
            </span>
          )}
          {notas && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded inline-flex items-center gap-1 text-xs font-semibold">
              <AlertCircle className="h-3 w-3" /> {notas}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
