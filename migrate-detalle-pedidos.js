const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/pos.db');

async function migrate() {
  try {
    // Disable foreign keys temporarily
    await new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = OFF', (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    // Create a backup of detalle_pedidos
    await new Promise((resolve, reject) => {
      db.run('CREATE TABLE detalle_pedidos_backup AS SELECT * FROM detalle_pedidos', (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    console.log('✓ Backup created');

    // Drop the old table
    await new Promise((resolve, reject) => {
      db.run('DROP TABLE detalle_pedidos', (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    console.log('✓ Old table dropped');

    // Create new table without foreign key constraint on producto_id
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE detalle_pedidos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pedido_id INTEGER NOT NULL,
          producto_id INTEGER,
          cantidad INTEGER NOT NULL,
          precio_unitario DECIMAL(10,2) NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          menu_item_id INTEGER,
          especificaciones TEXT,
          notas TEXT,
          FOREIGN KEY(pedido_id) REFERENCES pedidos(id),
          FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    console.log('✓ New table created (removed producto_id foreign key constraint)');

    // Restore data
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO detalle_pedidos 
        SELECT id, pedido_id, producto_id, cantidad, precio_unitario, subtotal, menu_item_id, especificaciones, notas 
        FROM detalle_pedidos_backup
      `, (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    console.log('✓ Data restored');

    // Drop backup
    await new Promise((resolve, reject) => {
      db.run('DROP TABLE detalle_pedidos_backup', (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    console.log('✓ Backup dropped');

    // Re-enable foreign keys
    await new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    console.log('✓ Foreign keys re-enabled');
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    db.close();
  }
}

migrate();
