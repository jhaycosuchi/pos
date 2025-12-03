import Database from 'better-sqlite3';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || './database/pos.db';
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export async function initDb(): Promise<void> {
  const database = getDb();
  // Aquí se ejecutaría el schema, pero por simplicidad lo haremos manualmente
  return;
}