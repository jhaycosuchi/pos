/**
 * CONFIGURATION - ESTADOS DE CUENTA
 * Este es el ÚNICO lugar de verdad sobre los estados de cuenta
 * Si cambias algo aquí, el proyecto entero se comporta consistentemente
 * 
 * NOTA: Estos valores deben coincidir con ESTADOS.CUENTA en lib/config.ts
 */

// Estados de cuenta - IMPORTA que coincidan con ESTADOS.CUENTA en config.ts
const STATES = {
  ABIERTA: 'abierta' as const,      // Cuenta activa, se agregan pedidos
  CERRADA: 'cerrada' as const,      // Lista para pagar, NO se agregan pedidos
  COBRADA: 'cobrada' as const       // Transacción completada, NO mostrar
};

export const ACCOUNT_STATES = STATES;

/**
 * DÓNDE APARECEN LAS CUENTAS
 * Define qué estados son visibles en cada página/filtro
 */
export const VISIBLE_IN = {
  // areas-activas: Muestra cuentas abiertas (agregar pedidos) y cerradas (cobrar)
  AREAS_ACTIVAS: [STATES.ABIERTA, STATES.CERRADA],
  
  // caja: Abiertos (agregar pedidos, ver detalles)
  CAJA_ABIERTOS: [STATES.ABIERTA],
  
  // caja: Cobrar (cuentas listas para pagar)
  CAJA_COBRAR: [STATES.CERRADA],
  
  // caja: Historial (cuentas ya cobradas)
  CAJA_HISTORIAL: [STATES.COBRADA],
  
  // Todas las cuentas activas (no cobradas)
  ACTIVAS: [STATES.ABIERTA, STATES.CERRADA],
  
  // Todas EXCEPTO cobradas (lo opuesto)
  NO_COBRADAS: [STATES.ABIERTA, STATES.CERRADA]
};

/**
 * QUÉ ACCIONES SE PERMITEN EN CADA ESTADO
 * Define transiciones válidas
 */
export const ALLOW_ACTIONS = {
  // Agregar pedidos: solo en cuentas abiertas
  ADD_PEDIDOS: [STATES.ABIERTA],
  
  // Cerrar cuenta: solo desde abierta → cerrada
  CLOSE_ACCOUNT: [STATES.ABIERTA],
  
  // Cobrar cuenta: solo desde cerrada → cobrada
  PAY_ACCOUNT: [STATES.CERRADA],
  
  // Ver detalles: en abiertas y cerradas
  VIEW_DETAILS: [STATES.ABIERTA, STATES.CERRADA],
  
  // Hacer modificaciones: solo en abiertas
  MODIFY: [STATES.ABIERTA]
};

/**
 * TRANSICIONES VÁLIDAS
 * Define qué estado puede ir a cuál
 */
export const VALID_TRANSITIONS = {
  [STATES.ABIERTA]: [STATES.CERRADA],    // abierta → cerrada
  [STATES.CERRADA]: [STATES.COBRADA],    // cerrada → cobrada
  [STATES.COBRADA]: []                   // cobrada → (ninguno, final)
};

/**
 * HELPER FUNCTIONS
 */
export function isValidTransition(fromState: string, toState: string): boolean {
  const transitions = VALID_TRANSITIONS[fromState as keyof typeof VALID_TRANSITIONS];
  return transitions ? transitions.includes(toState) : false;
}

export function canDoAction(state: string, action: keyof typeof ALLOW_ACTIONS): boolean {
  const allowedStates = ALLOW_ACTIONS[action];
  return allowedStates.some(s => s === state);
}

export function isVisibleIn(state: string, location: keyof typeof VISIBLE_IN): boolean {
  const visibleStates = VISIBLE_IN[location];
  return visibleStates.some(s => s === state);
}

export function getStateDescription(state: string): string {
  switch (state) {
    case STATES.ABIERTA:
      return 'Activa - Se pueden agregar pedidos';
    case STATES.CERRADA:
      return 'Cerrada - Lista para cobrar';
    case STATES.COBRADA:
      return 'Cobrada - Transacción completada';
    default:
      return 'Estado desconocido';
  }
}

/**
 * COLORES PARA UI
 */
export const STATE_COLORS = {
  [STATES.ABIERTA]: 'bg-green-600 text-white',
  [STATES.CERRADA]: 'bg-yellow-600 text-white',
  [STATES.COBRADA]: 'bg-gray-600 text-white'
};

export const STATE_ICONS = {
  [STATES.ABIERTA]: '🟢',
  [STATES.CERRADA]: '🟡',
  [STATES.COBRADA]: '⚫'
};
