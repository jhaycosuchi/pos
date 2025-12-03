import { getDb } from '../../../lib/db';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Edit,
  Save,
  X,
  Calculator,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface PrecioItem {
  id: number;
  nombre: string;
  precio_actual: number;
  precio_anterior?: number;
  categoria: string;
  disponible: boolean;
  ultima_actualizacion: string;
}

async function getPreciosData(): Promise<PrecioItem[]> {
  const db = getDb();
  const items = db.prepare(`
    SELECT
      id,
      nombre,
      precio as precio_actual,
      categoria,
      disponible,
      actualizado_en as ultima_actualizacion
    FROM menu_items
    WHERE disponible = 1
    ORDER BY categoria, nombre
  `).all();

  return items as PrecioItem[];
}

async function getEstadisticasPrecios() {
  const db = getDb();

  const total = db.prepare('SELECT COUNT(*) as count FROM menu_items WHERE disponible = 1').get();
  const precioPromedio = db.prepare('SELECT AVG(precio) as avg FROM menu_items WHERE disponible = 1').get();
  const precioMasAlto = db.prepare('SELECT MAX(precio) as max FROM menu_items WHERE disponible = 1').get();
  const precioMasBajo = db.prepare('SELECT MIN(precio) as min FROM menu_items WHERE disponible = 1').get();

  return {
    total: total?.count || 0,
    promedio: precioPromedio?.avg || 0,
    maximo: precioMasAlto?.max || 0,
    minimo: precioMasBajo?.min || 0
  };
}

function calcularCambioPrecio(actual: number, anterior?: number): { cambio: number; porcentaje: number; tendencia: 'up' | 'down' | 'stable' } {
  if (!anterior || anterior === 0) return { cambio: 0, porcentaje: 0, tendencia: 'stable' };

  const cambio = actual - anterior;
  const porcentaje = (cambio / anterior) * 100;

  return {
    cambio,
    porcentaje,
    tendencia: cambio > 0 ? 'up' : cambio < 0 ? 'down' : 'stable'
  };
}

export default async function PreciosPage() {
  const precios = await getPreciosData();
  const stats = await getEstadisticasPrecios();

  // Agrupar por categoría
  const preciosPorCategoria = precios.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = [];
    }
    acc[item.categoria].push(item);
    return acc;
  }, {} as Record<string, PrecioItem[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Precios</h1>
          <p className="text-gray-600 mt-1">Administra precios, márgenes y estrategias de venta</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Percent className="w-4 h-4" />
            Ajuste Masivo
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Calculator className="w-4 h-4" />
            Calcular Márgenes
          </button>
        </div>
      </div>

      {/* Estadísticas de precios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos con Precio</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
              <p className="text-3xl font-bold text-gray-900">${stats.promedio.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Precio Máximo</p>
              <p className="text-3xl font-bold text-gray-900">${stats.maximo.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Precio Mínimo</p>
              <p className="text-3xl font-bold text-gray-900">${stats.minimo.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de precios */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Recomendaciones de Precios</h3>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Considera revisar productos con precios por debajo del promedio</li>
              <li>• Los productos premium podrían beneficiarse de ajustes de precio</li>
              <li>• Revisa márgenes de ganancia mensualmente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de precios por categoría */}
      <div className="space-y-6">
        {Object.entries(preciosPorCategoria).map(([categoria, items]) => (
          <div key={categoria} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">{categoria}</h2>
              <p className="text-sm text-gray-600">{items.length} producto{items.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tendencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Actualización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => {
                    const cambio = calcularCambioPrecio(item.precio_actual, item.precio_anterior);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-gray-900">
                            ${item.precio_actual.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cambio.tendencia !== 'stable' ? (
                            <div className={`flex items-center gap-1 ${
                              cambio.tendencia === 'up' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {cambio.tendencia === 'up' ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span className="text-sm font-medium">
                                {cambio.tendencia === 'up' ? '+' : ''}{cambio.porcentaje.toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Sin cambios</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.ultima_actualizacion ?
                            new Date(item.ultima_actualizacion).toLocaleDateString('es-ES') :
                            'Nunca'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 px-3 py-1 text-xs font-medium rounded bg-green-100 hover:bg-green-200 transition-colors">
                              +10%
                            </button>
                            <button className="text-red-600 hover:text-red-900 px-3 py-1 text-xs font-medium rounded bg-red-100 hover:bg-red-200 transition-colors">
                              -10%
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {precios.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos con precios</h3>
            <p className="text-gray-500 mb-6">Los productos aparecerán aquí cuando tengan precios asignados</p>
            <a
              href="/dashboard/menu"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Ir al Menú
            </a>
          </div>
        )}
      </div>
    </div>
  );
}