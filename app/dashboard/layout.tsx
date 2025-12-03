import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({
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

  return (
    <div className="min-h-screen bg-light">
      <Navbar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}