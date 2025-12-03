import { AlertCircle, Flame, CheckCircle } from 'lucide-react';

interface ColumnHeaderProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  colorClass: string;
}

export function ColumnHeader({ title, count, icon, colorClass }: ColumnHeaderProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 p-6 ${colorClass}`}>
      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        {icon}
        {title}
      </h2>
      <p className={`text-4xl font-bold mt-3 ${colorClass.split('border-')[1]?.split('-')[0] ? `text-${colorClass.split('border-')[1].split('-')[0]}-600` : 'text-red-600'}`}>
        {count}
      </p>
    </div>
  );
}
