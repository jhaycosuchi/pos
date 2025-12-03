import { CheckCircle } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center border-l-4 border-green-600">
      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
      <h3 className="text-3xl font-bold text-gray-900 mb-2">¡Cocina al día!</h3>
      <p className="text-gray-600 text-xl">No hay pedidos en este momento</p>
    </div>
  );
}
