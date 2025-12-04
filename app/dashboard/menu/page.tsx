'use client';

import { useState, useEffect } from 'react';
import { Utensils, Plus, RefreshCw, AlertCircle, CheckCircle, Edit2, Save, X } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatDateMexico } from '@/lib/dateUtils';
import { API, IMAGES } from '@/lib/config';

interface MenuItem {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  vegetariano?: boolean;
  picante?: boolean;
  favorito?: boolean;
  destacado?: boolean;
  categoria_id?: number;
  categoria?: string;
}

interface MenuCategory {
  nombre: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [menuAdminItems, setMenuAdminItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [productosSinStock, setProductosSinStock] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stockUpdating, setStockUpdating] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<MenuItem>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenu();
    fetchMenuAdmin();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      // Obtener datos del usuario del token (asumimos que está en el cliente)
      const response = await fetch(API.AUTH, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.rol === 'admin');
      }
    } catch (error) {
      console.error('Error verificando rol:', error);
    }
  };

  const fetchMenuAdmin = async () => {
    try {
      const response = await fetch(API.MENU_ADMIN);
      if (response.ok) {
        const data = await response.json();
        setMenuAdminItems(data);
      }
    } catch (error) {
      console.error('Error fetching menu admin:', error);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(API.MENU);
      if (response.ok) {
        const data = await response.json();
        setMenu(data);
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].nombre);
        }
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncMenu = async () => {
    setSyncing(true);
    try {
      const response = await fetch(API.MENU_SYNC, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchMenu(); // Recargar el menú después de sincronizar
        alert('Menú sincronizado exitosamente');
      } else {
        const data = await response.json();
        alert(`Error sincronizando: ${data.message}`);
      }
    } catch (error) {
      console.error('Error syncing menu:', error);
      alert('Error de conexión al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const marcarSinStock = async (itemId: number, nombre: string, razonParam?: string, duracionParam?: number) => {
    const razon = razonParam || prompt('¿Razón? (opcional - máximo 24 horas)', 'Se agotó');
    const duracion = duracionParam || parseInt(prompt('¿Duración en horas?', '24') || '24');
    
    if (razon === null) return;

    setStockUpdating(itemId);
    try {
      const response = await fetch(API.STOCK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'marcar-sin-stock',
          menu_item_id: itemId,
          razon: razon || 'Temporalmente no disponible',
          duracion_horas: duracion
        })
      });

      if (response.ok) {
        alert(`${nombre} marcado como sin stock`);
        await cargarProductosSinStock();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error marcando sin stock:', error);
      alert('Error al marcar como sin stock');
    } finally {
      setStockUpdating(null);
    }
  };

  const restaurarStock = async (itemId: number, nombre: string) => {
    setStockUpdating(itemId);
    try {
      const response = await fetch(API.STOCK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'restaurar-stock',
          menu_item_id: itemId
        })
      });

      if (response.ok) {
        alert(`${nombre} restaurado a disponible`);
        await cargarProductosSinStock();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error restaurando stock:', error);
      alert('Error al restaurar stock');
    } finally {
      setStockUpdating(null);
    }
  };

  const cargarProductosSinStock = async () => {
    try {
      const response = await fetch(`${API.STOCK}?tipo=lista`);
      if (response.ok) {
        const data = await response.json();
        setProductosSinStock(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando productos sin stock:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleSave = async () => {
    if (!editingId) return;

    setSaving(true);
    try {
      const response = await fetch(API.MENU_ADMIN, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editData }),
      });

      if (response.ok) {
        setMenuAdminItems(menuAdminItems.map(item => 
          item.id === editingId ? { ...item, ...editData } : item
        ));
        setEditingId(null);
        setEditData({});
        alert('✅ Item actualizado exitosamente');
      } else {
        alert('❌ Error al actualizar');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este item?')) return;

    try {
      const response = await fetch(API.MENU_ADMIN, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setMenuAdminItems(menuAdminItems.filter(item => item.id !== id));
        alert('✅ Item eliminado exitosamente');
      } else {
        alert('❌ Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('❌ Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedCategoryData = menu.find(cat => cat.nombre === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header con Logo */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Image
                src={IMAGES.LOGO}
                alt="Logo POS System"
                width={120}
                height={120}
                className="rounded-2xl shadow-xl border-4 border-white"
              />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-success rounded-full border-4 border-white shadow-lg"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-primary mb-1">Gestión del Menú</h1>
              <p className="text-gray-600 font-medium">Administra el menú completo desde Google Sheets</p>
              <p className="text-sm text-gray-500 mt-1">Sistema de punto de venta profesional</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={syncMenu}
              disabled={syncing}
              className="flex items-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-6 w-6 ${syncing ? 'animate-spin' : ''}`} />
              <span className="font-medium">
                {syncing ? 'Sincronizando...' : 'Sincronizar con Google Sheets'}
              </span>
            </button>
            <button
              onClick={() => alert('Funcionalidad próximamente')}
              className="flex items-center space-x-3 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-6 w-6" />
              <span className="font-medium">Agregar Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selector de categoría */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-2">
          {menu.map((category) => (
            <button
              key={category.nombre}
              onClick={() => setSelectedCategory(category.nombre)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.nombre
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.nombre} ({category.items.length})
            </button>
          ))}
        </div>
      </div>

      {/* Panel de control de stock para admin */}
      {isAdmin && productosSinStock.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-800">
              Productos Sin Stock ({productosSinStock.length})
            </h2>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {productosSinStock.map((item) => (
              <div
                key={item.menu_item_id}
                className="bg-white p-3 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-900">{item.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {item.categoria} - Razón: {item.razon}
                  </p>
                  <p className="text-xs text-gray-500">
                    Hasta: {formatDateMexico(item.fecha_expiracion)}
                  </p>
                </div>
                <button
                  onClick={() => restaurarStock(item.menu_item_id, item.nombre)}
                  disabled={stockUpdating === item.menu_item_id}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  ✓ Restaurar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de items */}
      {selectedCategoryData && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-primary" />
              {selectedCategoryData.nombre} ({selectedCategoryData.items.length} items)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imagen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedCategoryData.items.map((item, index) => {
                  const itemStock = productosSinStock.find(
                    (s) => s.menu_item_id === item.id
                  );
                  const isEditing = editingId === item.id;

                  if (isEditing) {
                    return (
                      <tr key={index} className="bg-orange-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            placeholder="URL imagen"
                            value={editData.imagen_url || ''}
                            onChange={(e) => setEditData({ ...editData, imagen_url: e.target.value })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editData.nombre || ''}
                            onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            value={editData.descripcion || ''}
                            onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            value={editData.precio || ''}
                            onChange={(e) => setEditData({ ...editData, precio: parseFloat(e.target.value) })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm font-bold"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-1 justify-center">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={editData.vegetariano || false}
                                onChange={(e) => setEditData({ ...editData, vegetariano: e.target.checked })}
                                className="w-3 h-3"
                              />
                              <span className="text-xs">Veg</span>
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={editData.picante || false}
                                onChange={(e) => setEditData({ ...editData, picante: e.target.checked })}
                                className="w-3 h-3"
                              />
                              <span className="text-xs">Pic</span>
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <Save className="h-4 w-4" />
                              {saving ? 'Guardando' : 'Guardar'}
                            </button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm font-medium inline-flex items-center gap-1"
                            >
                              <X className="h-4 w-4" />
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 ${itemStock ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.imagen_url ? (
                          <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={item.imagen_url}
                              alt={item.nombre}
                              fill
                              sizes="48px"
                              className="object-cover"
                              onError={(e) => {
                                console.error(
                                  `Error cargando imagen de ${item.nombre}:`,
                                  item.imagen_url
                                );
                                (e.target as any).src = '/images/menu/placeholder.svg';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-400">Sin imagen</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {item.nombre}
                          {itemStock && (
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                              Sin stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {item.descripcion}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-primary">
                          ${item.precio.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {itemStock ? (
                          <span className="text-red-600 font-semibold text-sm">
                            No disponible
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold text-sm">
                            Disponible
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(item)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors inline-flex items-center gap-1"
                            >
                              <Edit2 className="h-4 w-4" />
                              Editar
                            </button>
                            {itemStock ? (
                              <button
                                onClick={() =>
                                  restaurarStock(item.id, item.nombre)
                                }
                                disabled={stockUpdating === item.id}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Restaurar
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const razon = prompt(
                                    'Motivo de falta de stock (opcional):'
                                  );
                                  const duracion = prompt(
                                    'Duración en horas (default: 24):'
                                  );
                                  marcarSinStock(
                                    item.id,
                                    item.nombre,
                                    razon || 'Stock agotado',
                                    duracion ? parseInt(duracion) : 24
                                  );
                                }}
                                disabled={stockUpdating === item.id}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <AlertCircle className="h-4 w-4" />
                                Sin stock
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}