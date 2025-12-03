import { getDb } from '../../../lib/db';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Tag,
  ChefHat,
  Coffee,
  Pizza,
  Sandwich,
  Salad
} from 'lucide-react';

interface MenuItem {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  disponible: boolean;
  imagen_url?: string;
}

async function getMenuItems(): Promise<MenuItem[]> {
  const db = getDb();
  const items = db.prepare(`
    SELECT
      id,
      nombre,
      precio,
      descripcion,
      categoria,
      disponible,
      imagen_url
    FROM menu_items
    ORDER BY categoria, nombre
  `).all();

  return items as MenuItem[];
}

async function getEstadisticasMenu() {
  const db = getDb();

  const total = db.prepare('SELECT COUNT(*) as count FROM menu_items').get();
  const disponibles = db.prepare('SELECT COUNT(*) as count FROM menu_items WHERE disponible = 1').get();
  const categorias = db.prepare('SELECT COUNT(DISTINCT categoria) as count FROM menu_items').get();
  const precioPromedio = db.prepare('SELECT AVG(precio) as avg FROM menu_items WHERE disponible = 1').get();

  return {
    total: total?.count || 0,
    disponibles: disponibles?.count || 0,
    categorias: categorias?.count || 0,
    precioPromedio: precioPromedio?.avg || 0
  };
}

function getCategoriaIcon(categoria: string) {
  const categoriaLower = categoria.toLowerCase();
  if (categoriaLower.includes('pizza')) return <Pizza className="w-5 h-5" />;
  if (categoriaLower.includes('bebida') || categoriaLower.includes('cafe')) return <Coffee className="w-5 h-5" />;
  if (categoriaLower.includes('ensalada') || categoriaLower.includes('salad')) return <Salad className="w-5 h-5" />;
  if (categoriaLower.includes('sandwich') || categoriaLower.includes('hamburguesa')) return <Sandwich className="w-5 h-5" />;
  return <ChefHat className="w-5 h-5" />;
}

export default async function MenuPage() {
  const menuItems = await getMenuItems();
  const stats = await getEstadisticasMenu();

  // Agrupar por categoría
  const itemsPorCategoria = menuItems.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = [];
    }
    acc[item.categoria].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión del Menú</h1>
          <p className="text-gray-600 mt-1">Administra productos, precios y categorías</p>
        </div>
        <a
          href="/dashboard/menu/nuevo"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </a>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-3xl font-bold text-gray-900">{stats.disponibles}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorías</p>
              <p className="text-3xl font-bold text-gray-900">{stats.categorias}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
              <p className="text-3xl font-bold text-gray-900">${stats.precioPromedio.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Todas las categorías</option>
              {Object.keys(itemsPorCategoria).map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="no-disponible">No disponible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Productos por categoría */}
      <div className="space-y-6">
        {Object.entries(itemsPorCategoria).map(([categoria, items]) => (
          <div key={categoria} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="text-green-600">
                  {getCategoriaIcon(categoria)}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{categoria}</h2>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                  {items.length} producto{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.nombre}</h3>
                      {item.descripcion && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.descripcion}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.disponible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">${item.precio.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {menuItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos en el menú</h3>
            <p className="text-gray-500 mb-6">Comienza agregando tu primer producto al menú</p>
            <a
              href="/dashboard/menu/nuevo"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar Primer Producto
            </a>
          </div>
        )}
      </div>
    </div>
  );
}