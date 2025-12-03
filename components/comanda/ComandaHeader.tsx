import { RefreshCw } from 'lucide-react';

interface ComandaHeaderProps {
  autoRefresh: boolean;
  onToggleAutoRefresh: (value: boolean) => void;
  onRefresh: () => void;
}

export function ComandaHeader({ autoRefresh, onToggleAutoRefresh, onRefresh }: ComandaHeaderProps) {
  return (
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
              onClick={() => onToggleAutoRefresh(!autoRefresh)}
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
              onClick={onRefresh}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-3 hover:bg-blue-700 transition-colors text-lg"
            >
              <RefreshCw className="h-6 w-6" />
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
