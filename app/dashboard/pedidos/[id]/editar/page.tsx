export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getDb } from '../../../../../lib/db';
import EditarCuentaClient from './client';

interface Cuenta {
  id: number;
  mesa_numero: string;
  mesero_id: number;
  estado: string;
  total: number;
  fecha_apertura: string;
}

async function getCuenta(id: string): Promise<Cuenta | null> {
  const db = getDb();
  const cuenta = db.prepare(`
    SELECT
      id,
      mesa_numero,
      mesero_id,
      estado,
      total,
      fecha_apertura
    FROM cuentas
    WHERE id = ?
  `).get(parseInt(id));

  return cuenta as Cuenta | null;
}

async function getMeseros() {
  const db = getDb();
  const meseros = db.prepare(`
    SELECT id, nombre, username
    FROM usuarios
    WHERE rol = 'mesero' AND activo = 1
    ORDER BY nombre
  `).all();

  return meseros as Array<{ id: number; nombre: string; username: string }>;
}

export default async function EditarCuentaPage({ params }: { params: { id: string } }) {
  const cuenta = await getCuenta(params.id);

  if (!cuenta) {
    redirect('/dashboard/pedidos');
  }

  const meseros = await getMeseros();

  return <EditarCuentaClient cuenta={cuenta} meseros={meseros} />;
}
