'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

interface MenuItem {
  id: number;
  nombre: string;
  precio: number;
}

interface PedidoItem {
  menu_item_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  especificaciones: string;
  notas: string;
}

interface Mesero {
  id: number;
  nombre: string;
}

export default function PedidoForm() {
  const router = useRouter();
  const [meseros, setMeseros] = useState<Mesero[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    mesero_id: '',
    mesa_numero: '',
    comensales: '1',
    es_para_llevar: false,
  });

  const [items, setItems] = useState<PedidoItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productQuantity, setProductQuantity] = useState<string>('1');

  // Fetch meseros and menu on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mesesResponse, menuResponse] = await Promise.all([
          fetch('/pos/api/usuarios?rol=mesero'),
          fetch('/pos/api/menu'),
        ]);

        if (mesesResponse.ok) {
          const meseros = await mesesResponse.json();
          setMeseros(Array.isArray(meseros) ? meseros : []);
        }

        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          const menuItems = Array.isArray(menuData) ? menuData : [];
          setMenu(menuItems.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio || 0,
          })));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar datos del sistema');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setError('');
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      setError('Selecciona un producto');
      return;
    }

    const quantity = parseInt(productQuantity) || 1;
    const product = menu.find(p => p.id === parseInt(selectedProduct));

    if (!product) {
      setError('Producto no encontrado');
      return;
    }

    // Check if item already exists
    const existingItem = items.findIndex(
      item => item.menu_item_id === product.id
    );

    if (existingItem >= 0) {
      // Update quantity
      const updatedItems = [...items];
      updatedItems[existingItem].cantidad += quantity;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems(prev => [
        ...prev,
        {
          menu_item_id: product.id,
          producto_nombre: product.nombre,
          cantidad: quantity,
          precio_unitario: product.precio,
          especificaciones: '',
          notas: '',
        },
      ]);
    }

    setSelectedProduct('');
    setProductQuantity('1');
    setError('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.mesero_id) {
      setError('Selecciona un mesero');
      return;
    }

    if (!formData.es_para_llevar && !formData.mesa_numero) {
      setError('Ingresa el número de mesa');
      return;
    }

    if (items.length === 0) {
      setError('Agrega al menos un item al pedido');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/pos/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mesero_id: parseInt(formData.mesero_id),
          mesa_numero: formData.mesa_numero || 'Llevar',
          comensales: parseInt(formData.comensales) || 1,
          es_para_llevar: formData.es_para_llevar ? 1 : 0,
          items,
          total: calculateTotal(),
          estado: 'pendiente',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Error al crear el pedido');
        setSubmitting(false);
        return;
      }

      const data = await response.json();
      setSuccess('Pedido creado exitosamente: ' + data.pedido.numero_pedido);

      // Reset form
      setFormData({
        mesero_id: '',
        mesa_numero: '',
        comensales: '1',
        es_para_llevar: false,
      });
      setItems([]);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/pedidos');
      }, 2000);
    } catch (err) {
      setError('Error de conexión: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando datos...</div>;
  }

  const total = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mesero */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mesero *
          </label>
          <select
            name="mesero_id"
            value={formData.mesero_id}
            onChange={handleChange}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            required
          >
            <option value="">Seleccionar mesero...</option>
            {meseros.map(mesero => (
              <option key={mesero.id} value={mesero.id}>
                {mesero.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Mesa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.es_para_llevar ? 'Cliente' : 'Mesa'} *
          </label>
          <input
            type="text"
            name="mesa_numero"
            value={formData.mesa_numero}
            onChange={handleChange}
            placeholder={formData.es_para_llevar ? 'Nombre del cliente' : 'Mesa 1'}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            required={!formData.es_para_llevar}
          />
        </div>

        {/* Comensales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Comensales
          </label>
          <input
            type="number"
            name="comensales"
            value={formData.comensales}
            onChange={handleChange}
            min="1"
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Para Llevar */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="es_para_llevar"
              checked={formData.es_para_llevar}
              onChange={handleChange}
              disabled={submitting}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-50"
            />
            <span className="text-sm font-medium text-gray-700">Pedido para llevar</span>
          </label>
        </div>
      </div>

      {/* Seleccionar Productos */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Productos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto *
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Seleccionar producto...</option>
              {menu.map(item => (
                <option key={item.id} value={item.id}>
                  {item.nombre} (${item.precio.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
              min="1"
              disabled={submitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddItem}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Items del Pedido */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Items del Pedido</h3>
        {items.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No hay items agregados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Producto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Cantidad</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Precio Unit.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Subtotal</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.producto_nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.cantidad}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">${item.precio_unitario.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ${(item.cantidad * item.precio_unitario).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={submitting}
                        className="text-red-600 hover:text-red-800 disabled:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total del Pedido:</span>
          <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {submitting ? 'Creando...' : 'Crear Pedido'}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={submitting}
          className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
