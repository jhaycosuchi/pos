'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCartIcon,
  XMarkIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

// Config y Services
import { API, PAGES, IMAGES } from '@/lib/config';
import { AuthService } from '@/lib/services/auth.service';

// Components
import InitialDeliveryOptions from '@/components/atiendemesero/InitialDeliveryOptions';
import MenuGrid from '@/components/atiendemesero/MenuGrid';
import ProductModal from '@/components/atiendemesero/ProductModal';
import CartContent from '@/components/atiendemesero/CartContent';
import ActiveAreasModal from '@/components/atiendemesero/ActiveAreasModal';

interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria?: string;
}

interface CartItemOptions {
  notas: string[];
  notaPersonalizada: string;
}

interface CartItem {
  id: string;
  item: MenuItem;
  quantity: number;
  options: CartItemOptions;
}

interface MenuCategory {
  id?: string;
  name?: string;
  nombre?: string;
  items: MenuItem[];
}

export default function AtiendemeseroPage() {
  const searchParams = useSearchParams();
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [isParaLlevar, setIsParaLlevar] = useState<boolean | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showActiveAreas, setShowActiveAreas] = useState(false);
  const [continuePedidoId, setContinuePedidoId] = useState<number | null>(null);
  const [cuentaId, setCuentaId] = useState<number | null>(null);
  
  // Flow states
  const [step, setStep] = useState<'delivery-type' | 'menu'>('delivery-type');
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  const loadExistingOrderForMesa = async (mesaNumero: string) => {
    try {
      const response = await fetch(API.PEDIDO_BY_MESA(mesaNumero));
      
      if (response.ok) {
        const pedidoData = await response.json();
        setContinuePedidoId(pedidoData.id);
        
        // Convertir items del pedido al formato del carrito
        const cartItems: CartItem[] = pedidoData.items.map((item: any, index: number) => ({
          id: `existing-${item.id}-${index}`, // ID único para items existentes
          item: {
            nombre: item.nombre,
            descripcion: '',
            precio: item.precio_unitario,
            imagen_url: '',
            categoria: ''
          },
          quantity: item.cantidad,
          options: {
            notas: item.notas ? [item.notas] : [],
            notaPersonalizada: item.especificaciones || ''
          }
        }));
        
        setCart(cartItems);
      } else if (response.status !== 404) {
        console.error('Error loading existing order:', response.status);
      }
      // Si es 404, no hay pedido existente, continuar con carrito vacío
    } catch (error: any) {
      console.error('Error loading existing order for mesa:', error);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(API.MENU);
      const data = await response.json();
      setMenuData(data);
      if (data.length > 0) {
        setActiveCategory(data[0].nombre || data[0].name || 'General');
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching menu:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar parámetros de URL para cuenta existente
    const cuentaParam = searchParams.get('cuenta');
    const tipoParam = searchParams.get('tipo');
    
    if (cuentaParam) {
      setCuentaId(parseInt(cuentaParam));
      
      // Leer datos de la mesa desde localStorage (guardados por areas-activas)
      const mesaData = localStorage.getItem('mesa');
      if (mesaData) {
        try {
          const mesa = JSON.parse(mesaData);
          setTableNumber(mesa.numero.toString());
          
          if (tipoParam === 'para_llevar') {
            setIsParaLlevar(true);
          } else {
            setIsParaLlevar(false);
          }
          
          setStep('menu');
        } catch (error: any) {
          console.error('Error parsing mesa data:', error);
        }
      }
    }
    
    // Verificar si viene de mesas (desde localStorage)
    const selectedMesaData = localStorage.getItem('selectedMesa');
    if (selectedMesaData) {
      try {
        const mesa = JSON.parse(selectedMesaData);
        if (mesa && mesa.numero !== undefined) {
          setIsParaLlevar(false);
          setTableNumber(mesa.numero.toString());
          // Cargar pedido existente si hay uno
          loadExistingOrderForMesa(mesa.numero.toString());
          setStep('menu');
        }
        localStorage.removeItem('selectedMesa'); // Limpiar después de usar
      } catch (error: any) {
        console.error('Error parsing selectedMesa:', error);
      }
    }

    // Verificar si viene para crear un pedido para llevar desde una mesa
    const paraLlevarDesdeMesaData = localStorage.getItem('paraLlevarDesdeMesa');
    if (paraLlevarDesdeMesaData) {
      try {
        const mesa = JSON.parse(paraLlevarDesdeMesaData);
        setIsParaLlevar(true);
        setTableNumber(`P.Llevar-Mesa${mesa.numero}`); // ID único para pedidos para llevar desde mesas
        setStep('menu');
        localStorage.removeItem('paraLlevarDesdeMesa'); // Limpiar después de usar
      } catch (error: any) {
        console.error('Error parsing paraLlevarDesdeMesa:', error);
      }
    }

    // Verificar si viene para continuar un pedido para llevar existente
    const continuePedidoData = localStorage.getItem('continuePedidoLlevar');
    if (continuePedidoData) {
      try {
        const pedido = JSON.parse(continuePedidoData);
        setIsParaLlevar(true);
        setTableNumber('PARA_LLEVAR');
        setContinuePedidoId(pedido.id);
        setStep('menu');
        localStorage.removeItem('continuePedidoLlevar'); // Limpiar después de usar
      } catch (error: any) {
        console.error('Error parsing continuePedidoLlevar:', error);
      }
    }

    // Verificar si viene de URL parameters (por compatibilidad)
    const mesaParam = searchParams.get('mesa');
    if (mesaParam) {
      setIsParaLlevar(false);
      setTableNumber(mesaParam);
      loadExistingOrderForMesa(mesaParam);
      setStep('menu');
    }

    // Escuchar eventos de InitialDeliveryOptions
    window.addEventListener('deliveryTypeSelected', handleDeliveryTypeEvent);
    fetchMenu();

    return () => {
      window.removeEventListener('deliveryTypeSelected', handleDeliveryTypeEvent);
    };
  }, [searchParams]);

  const handleDeliveryTypeEvent = (e: Event) => {
    const event = e as CustomEvent;
    if (event.detail.paraLlevar) {
      setIsParaLlevar(true);
      setTableNumber('PARA_LLEVAR');
      setStep('menu');
    }
  };

  const handleProductClick = (item: MenuItem) => {
    setSelectedProduct(item);
  };

  const addToCart = (product: MenuItem, notes: string[], customNote: string) => {
    const newCartItem: CartItem = {
      id: Date.now().toString(),
      item: product,
      quantity: 1,
      options: {
        notas: notes,
        notaPersonalizada: customNote
      }
    };
    setCart([...cart, newCartItem]);
    setSelectedProduct(null);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getNotasText = (options: CartItemOptions) => {
    const allNotes = [...options.notas];
    if (options.notaPersonalizada) {
      allNotes.push(options.notaPersonalizada);
    }
    return allNotes.join(', ');
  };

  const total = cart.reduce((sum, item) => sum + item.item.precio * item.quantity, 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const sendOrder = async () => {
    console.log('sendOrder llamado', { cart: cart.length, tableNumber, isParaLlevar, continuePedidoId });
    
    if (cart.length === 0) {
      alert('Por favor agrega productos al carrito');
      return;
    }
    
    if (!tableNumber) {
      alert('Por favor selecciona una mesa o elige "Para Llevar"');
      return;
    }

    // Si estamos editando un pedido existente, requerir autorización
    if (continuePedidoId) {
      requireAuthForEdit(() => sendOrderAuthorized());
      return;
    }

    // Para pedidos nuevos, proceder normalmente
    await sendOrderAuthorized();
  };

  const sendOrderAuthorized = async () => {
    setSending(true);
    try {
      // Si estamos continuando un pedido existente, agregar items al pedido existente
      if (continuePedidoId) {
        console.log('Agregando items a pedido existente:', continuePedidoId);
        
        const updateData = {
          items: cart.map(item => {
            const notas = getNotasText(item.options);
            return {
              menu_item_id: 1,
              producto_nombre: item.item.nombre,
              cantidad: item.quantity,
              precio_unitario: item.item.precio,
              especificaciones: '',
              notas: notas || '',
              subtotal: item.item.precio * item.quantity
            };
          })
        };
        
        console.log('Datos de actualización:', updateData);
        
        const response = await fetch(API.PEDIDO_BY_ID(continuePedidoId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const responseData = await response.json();
          console.log('Pedido actualizado:', responseData);
          setShowSuccess(true);
          setCart([]);
          setTableNumber('');
          setIsParaLlevar(null);
          setContinuePedidoId(null);
          setShowCart(false);
          setStep('delivery-type');
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          alert(`Error al actualizar el pedido: ${errorData.message || 'Error desconocido'}`);
        }
      } else {
        // Crear nuevo pedido
        console.log('Creando nuevo pedido');
        
        const orderData = {
          mesero_id: AuthService.obtenerMeseroId(), // Obtener mesero dinámicamente
          mesa_numero: tableNumber,
          comensales: 1,
          es_para_llevar: isParaLlevar,
          cuenta_id: cuentaId,
          items: cart.map(item => {
            const notas = getNotasText(item.options);
            return {
              menu_item_id: 1,
              producto_nombre: item.item.nombre,
              cantidad: item.quantity,
              precio_unitario: item.item.precio,
              especificaciones: '',
              notas: notas || ''
            };
          }),
          total,
          estado: 'pendiente'
        };
        
        console.log('Datos de orden:', orderData);
        
        const response = await fetch(API.PEDIDOS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const responseData = await response.json();
          console.log('Orden creada:', responseData);
          setShowSuccess(true);
          setCart([]);
          setTableNumber('');
          setIsParaLlevar(null);
          setCuentaId(null);
          setShowCart(false);
          setStep('delivery-type');
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          alert(`Error al enviar la orden: ${errorData.message || 'Error desconocido'}`);
        }
      }
    } catch (error) {
      console.error('Error sending order:', error);
      alert('Error al enviar la orden: ' + String(error));
    } finally {
      setSending(false);
    }
  };

  const handleAuthSubmit = () => {
    if (authPin === '7933') { // PIN de caja
      setShowAuthModal(false);
      setAuthPin('');
      setAuthError('');
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      setAuthError('PIN incorrecto');
      setAuthPin('');
    }
  };

  const requireAuthForEdit = (action: () => void) => {
    setPendingAction(() => action);
    setShowAuthModal(true);
  };

  const resetToMesaSelection = () => {
    setStep('delivery-type');
    setTableNumber('');
    setIsParaLlevar(null);
    setContinuePedidoId(null);
    setCuentaId(null);
    setCart([]);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">Cargando menu...</p>
        </div>
      </div>
    );
  }

  // Step 0: Delivery Type Selection
  if (step === 'delivery-type') {
    return <InitialDeliveryOptions />;
  }

  // Menu View
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-gray-800/95 backdrop-blur-md shadow-xl z-40">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Image 
                src={IMAGES.LOGO}
                alt="Logo" 
                width={40} 
                height={40}
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 drop-shadow-lg"
                priority
              />
              <div>
                <h1 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">Mazuhi</h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-400">Modo Mesero</p>
              </div>
            </div>

            {/* Botones de control */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botón Áreas Activas */}
              <button 
                onClick={() => setShowActiveAreas(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full transition-all hover:scale-105 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40"
              >
                <span className="text-xs sm:text-sm md:text-base font-medium text-purple-400">
                  🏪 Áreas Activas
                </span>
              </button>

              {/* Mesa Badge */}
              <button 
                onClick={resetToMesaSelection}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full transition-all hover:scale-105 ${
                  isParaLlevar 
                    ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/40' 
                    : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40'
                }`}
              >
                <span className={`text-xs sm:text-sm md:text-base font-medium ${isParaLlevar ? 'text-green-400' : 'text-blue-400'}`}>
                  {isParaLlevar 
                    ? tableNumber.startsWith('P.Llevar-Mesa')
                      ? `📦 P.Llevar (Mesa ${tableNumber.split('Mesa')[1]})`
                      : '📦 Para Llevar'
                    : `🍽️ Mesa ${tableNumber}`
                  }
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500">Cambiar</span>
              </button>

              {/* Cart Button */}
              <button 
                onClick={() => setShowCart(true)}
                className="xl:hidden relative bg-orange-500 hover:bg-orange-600 p-2.5 sm:p-3 md:p-3.5 rounded-xl transition-all hover:scale-105 shadow-lg"
              >
                <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {menuData.map((category) => {
              const categoryName = category.nombre || category.name || '';
              return (
                <button
                  key={categoryName}
                  onClick={() => setActiveCategory(categoryName)}
                  className={`flex-shrink-0 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                    activeCategory === categoryName
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40'
                      : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  {categoryName.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <MenuGrid 
          menuData={menuData}
          activeCategory={activeCategory}
          cart={cart}
          onProductClick={handleProductClick}
        />

        {/* Desktop Cart Sidebar */}
        <aside className="hidden xl:flex w-80 2xl:w-96 3xl:w-[28rem] bg-gray-800 border-l border-gray-700 flex-col shadow-2xl">
          <CartContent 
            cart={cart}
            total={total}
            itemCount={itemCount}
            tableNumber={tableNumber}
            isParaLlevar={isParaLlevar}
            sending={sending}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            sendOrder={sendOrder}
            getNotasText={getNotasText}
            clearCart={() => setCart([])}
          />
        </aside>
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && !showCart && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          onClick={() => setShowCart(true)}
          className="xl:hidden fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 md:bottom-8 md:left-8 md:right-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 sm:py-5 md:py-6 px-6 sm:px-8 md:px-10 rounded-2xl sm:rounded-3xl shadow-2xl shadow-orange-500/30 flex items-center justify-between z-30 backdrop-blur-md border border-orange-400/30"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <ShoppingCartIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="font-bold text-base sm:text-lg md:text-xl">{itemCount} items</span>
          </div>
          <span className="font-bold text-lg sm:text-xl md:text-2xl">${total.toFixed(2)}</span>
        </motion.button>
      )}

      {/* Mobile Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="xl:hidden fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              
              <CartContent 
                cart={cart}
                total={total}
                itemCount={itemCount}
                tableNumber={tableNumber}
                isParaLlevar={isParaLlevar}
                sending={sending}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                sendOrder={sendOrder}
                getNotasText={getNotasText}
                clearCart={() => setCart([])}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {/* Active Areas Modal */}
      <ActiveAreasModal 
        isOpen={showActiveAreas}
        onClose={() => setShowActiveAreas(false)}
      />

      {/* Authorization Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Autorización Requerida</h3>
                  <p className="text-gray-400 text-sm">
                    Para editar pedidos existentes, necesitas autorización de caja
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">
                      PIN de Caja
                    </label>
                    <input
                      type="password"
                      value={authPin}
                      onChange={(e) => {
                        setAuthPin(e.target.value);
                        setAuthError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAuthSubmit();
                      }}
                      placeholder="****"
                      className="w-full bg-gray-700 text-white text-center text-2xl tracking-widest px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
                    />
                    {authError && (
                      <p className="text-red-400 text-sm mt-2 text-center font-medium">{authError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setShowAuthModal(false);
                        setAuthPin('');
                        setAuthError('');
                        setPendingAction(null);
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAuthSubmit}
                      className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Autorizar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


