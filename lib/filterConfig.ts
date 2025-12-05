/**
 * LÓGICA DE FILTRADO - AREAS ACTIVAS
 * 
 * REGLAS CLARAS:
 * 
 * TAB "MESAS" - Solo cuentas ABIERTAS en mesas (no para llevar)
 * ├─ Estado: DEBE ser 'abierta'
 * ├─ Tipo: DEBE ser 'cuenta'
 * └─ Mesa: DEBE tener número (no 'PARA_LLEVAR')
 * → Acción: Agregar pedidos / Ver detalles
 * → Cuando se cierra: Pasa a tab "COBRAR"
 * 
 * TAB "PARA LLEVAR" - Solo cuentas ABIERTAS para llevar
 * ├─ Estado: DEBE ser 'abierta'
 * ├─ Tipo: DEBE ser 'cuenta'
 * └─ Mesa: DEBE ser 'PARA_LLEVAR'
 * → Acción: Agregar pedidos / Ver detalles
 * → Cuando se cierra: Pasa a tab "COBRAR"
 * 
 * TAB "COBRAR" - Solo cuentas CERRADAS (cualquier tipo)
 * ├─ Estado: DEBE ser 'cerrada'
 * ├─ Tipo: NO importa ('cuenta', 'pedido_llevar')
 * └─ Mesa: NO importa (puede ser número o 'PARA_LLEVAR')
 * → Acción: Pagar / Ver detalles
 * → Cuando se cobra: Desaparece (estado 'cobrada' se filtra en API)
 * 
 * IMPORTANTE:
 * - Una cuenta NUNCA puede estar en dos tabs al mismo tiempo
 * - El estado es la fuente de verdad (abierta → cerrada → cobrada)
 * - Los filtros SIEMPRE verifican: estado + tipo + mesa_numero
 */

export function filterCuentasMesa(
  cuentasAbiertas: any[],
  cuentasCerradas: any[]
): any[] {
  return cuentasAbiertas.filter(c => 
    c.tipo === 'cuenta' &&                           // Tipo: cuenta
    c.mesa_numero &&                                 // Tiene mesa
    c.mesa_numero !== 'PARA_LLEVAR' &&              // NO es para llevar
    c.estado === 'abierta'                           // Estado: abierta
  );
}

export function filterCuentasLlevar(
  cuentasAbiertas: any[],
  cuentasCerradas: any[]
): any[] {
  return cuentasAbiertas.filter(c => 
    c.tipo === 'cuenta' &&                           // Tipo: cuenta
    (c.mesa_numero === 'PARA_LLEVAR' || !c.mesa_numero) && // Para llevar
    c.estado === 'abierta'                           // Estado: abierta
  );
}

export function filterCuentasCobrar(
  cuentasAbiertas: any[],
  cuentasCerradas: any[]
): any[] {
  return cuentasCerradas.filter(c => 
    c.estado === 'cerrada'                           // Estado: cerrada
    // No filtramos por tipo ni mesa porque ambas (mesas y para llevar) van aquí
  );
}

/**
 * Validación: Verifica que los filtros funcionen correctamente
 * Usar en desarrollo para debuggear
 */
export function validateFilters(
  cuentasAbiertas: any[],
  cuentasCerradas: any[]
) {
  const mesa = filterCuentasMesa(cuentasAbiertas, cuentasCerradas);
  const llevar = filterCuentasLlevar(cuentasAbiertas, cuentasCerradas);
  const cobrar = filterCuentasCobrar(cuentasAbiertas, cuentasCerradas);

  // Verificar que no hay duplicados
  const mesaIds = new Set(mesa.map(c => c.id));
  const llevarIds = new Set(llevar.map(c => c.id));
  const cobrarIds = new Set(cobrar.map(c => c.id));

  const overlap = Array.from(mesaIds).filter(id => llevarIds.has(id) || cobrarIds.has(id));

  if (overlap.length > 0) {
    console.warn('⚠️ VALIDACIÓN FALLA: Cuentas que aparecen en múltiples tabs:', overlap);
    return false;
  }

  console.log('✅ VALIDACIÓN OK: Sin duplicados en tabs');
  console.log(`   Mesas: ${mesa.length}, Para llevar: ${llevar.length}, Cobrar: ${cobrar.length}`);
  return true;
}
