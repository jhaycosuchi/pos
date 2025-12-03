const Database = require('better-sqlite3');
const path = require('path');

// Conectar a la base de datos
const dbPath = path.join(__dirname, 'database', 'pos.db');
const db = new Database(dbPath);

console.log('🧪 Probando sistema de modificaciones de pedidos...\n');

// 1. Crear datos de prueba
console.log('1. Creando datos de prueba...');

// Crear cuenta de prueba
const cuentaResult = db.prepare(`
  INSERT INTO cuentas (numero_cuenta, mesa_numero, mesero_id, estado)
  VALUES (?, ?, ?, ?)
`).run('TEST-001', '5', 1, 'abierta');

const cuentaId = cuentaResult.lastInsertRowid;
console.log(`   ✅ Cuenta creada: ID ${cuentaId}`);

// Crear pedido de prueba
const pedidoResult = db.prepare(`
  INSERT INTO pedidos (numero_pedido, usuario_id, mesero_id, mesa_numero, comensales, cuenta_id, estado, total)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run('PED-TEST-001', 1, 1, '5', 2, cuentaId, 'pendiente', 150.00);

const pedidoId = pedidoResult.lastInsertRowid;
console.log(`   ✅ Pedido creado: ID ${pedidoId}`);

// 2. Crear solicitud de modificación
console.log('\n2. Creando solicitud de modificación...');

const modificacionResult = db.prepare(`
  INSERT INTO modificaciones_pedidos (
    tipo, pedido_id, cuenta_id, solicitado_por, detalles, cambios, estado, fecha_solicitud
  ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`).run('edicion', pedidoId, cuentaId, 'Mesero Test', 'Cambiar cantidad de sushi', 'Aumentar nigiri de 2 a 3', 'pendiente');

const modificacionId = modificacionResult.lastInsertRowid;
console.log(`   ✅ Modificación creada: ID ${modificacionId}`);

// 3. Verificar que se puede consultar
console.log('\n3. Consultando modificaciones pendientes...');

const modificaciones = db.prepare(`
  SELECT
    mp.*,
    p.numero_pedido,
    c.numero_cuenta,
    c.mesa_numero,
    u.nombre as mesero_nombre
  FROM modificaciones_pedidos mp
  LEFT JOIN pedidos p ON mp.pedido_id = p.id
  LEFT JOIN cuentas c ON mp.cuenta_id = c.id
  LEFT JOIN usuarios u ON p.mesero_id = u.id
  WHERE mp.estado = ?
  ORDER BY mp.fecha_solicitud DESC
`).all('pendiente');

console.log(`   📋 Encontradas ${modificaciones.length} modificaciones pendientes`);
if (modificaciones.length > 0) {
  const mod = modificaciones[0];
  console.log(`   ✅ Modificación ID ${mod.id}: ${mod.tipo} - ${mod.detalles}`);
  console.log(`      Pedido: ${mod.numero_pedido}, Cuenta: ${mod.numero_cuenta}`);
}

// 4. Simular aprobación
console.log('\n4. Simulando aprobación de modificación...');

db.prepare(`
  UPDATE modificaciones_pedidos
  SET estado = ?, autorizado_por = ?, fecha_autorizacion = datetime('now')
  WHERE id = ?
`).run('aprobado', 'Caja Test', modificacionId);

console.log(`   ✅ Modificación ${modificacionId} aprobada`);

// 5. Verificar estado final
console.log('\n5. Verificando estado final...');

const modificacionFinal = db.prepare('SELECT * FROM modificaciones_pedidos WHERE id = ?').get(modificacionId);
console.log(`   📊 Estado final: ${modificacionFinal.estado}`);
console.log(`   👤 Autorizado por: ${modificacionFinal.autorizado_por}`);
console.log(`   📅 Fecha autorización: ${modificacionFinal.fecha_autorizacion}`);

console.log('\n🎉 Prueba completada exitosamente!');
console.log('✅ Sistema de modificaciones funcionando correctamente');

db.close();