const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/pos.db');

// Test query to see if we can insert into detalle_pedidos
db.all('SELECT * FROM menu_items LIMIT 1', (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }

  if (rows.length === 0) {
    console.log('No menu items found');
    db.close();
    return;
  }

  const menuItem = rows[0];
  console.log('Test menu item:', menuItem.id, menuItem.nombre);

  // Check if there's a pedido we can use
  db.all('SELECT id FROM pedidos ORDER BY id DESC LIMIT 1', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    const pedidoId = rows.length > 0 ? rows[0].id : null;
    console.log('Last pedido ID:', pedidoId);

    if (pedidoId) {
      // Show detalle_pedidos structure
      db.all(`SELECT * FROM detalle_pedidos WHERE pedido_id = ? LIMIT 1`, [pedidoId], (err, rows) => {
        if (err) {
          console.error('Error:', err);
        } else if (rows.length > 0) {
          console.log('\nLast detalle_pedido:');
          console.log(rows[0]);
        } else {
          console.log('No detalle_pedidos for this pedido');
        }
        db.close();
      });
    } else {
      console.log('No pedidos in database yet');
      db.close();
    }
  });
});
