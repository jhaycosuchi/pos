import { AlertCircle, X, Check } from 'lucide-react';

interface ItemCheckboxProps {
  nombre: string;
  cantidad: number;
  especificaciones?: string;
  notas?: string;
  isCompleted: boolean;
  isSmall?: boolean;
  onClick: () => void;
}

export function ItemCheckbox({
  nombre,
  cantidad,
  especificaciones,
  notas,
  isCompleted,
  isSmall = false,
  onClick
}: ItemCheckboxProps) {
  if (isCompleted && isSmall) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-2.5 rounded-lg border border-green-300 bg-green-50 transition-colors active:scale-95 opacity-50"
      >
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-600 text-sm line-through">
              {cantidad}x {nombre}
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border-2 transition-colors active:scale-95 ${
        isCompleted
          ? 'border-green-300 bg-green-50 opacity-50'
          : 'border-yellow-300 bg-white hover:bg-yellow-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1 w-5 h-5 rounded border-2 border-gray-400 bg-white"></div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-base">
            {cantidad}x {nombre}
          </div>
          {(especificaciones || notas) && (
            <div className="mt-1 flex gap-1 flex-wrap">
              {especificaciones && (
                <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded inline-flex items-center gap-1 text-xs font-semibold">
                  <X className="h-2.5 w-2.5" /> {especificaciones}
                </span>
              )}
              {notas && (
                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded inline-flex items-center gap-1 text-xs font-semibold">
                  <AlertCircle className="h-2.5 w-2.5" /> {notas}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
