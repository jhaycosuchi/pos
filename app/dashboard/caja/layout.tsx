import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

export default function CajaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  if (!user) {
    redirect('/login');
  }

  // Caja layout sin Navbar ni Sidebar - solo el contenido
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  );
}
