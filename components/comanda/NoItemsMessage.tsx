import { ReactNode } from 'react';
import { CheckCircle, ChefHat, Package } from 'lucide-react';

interface NoItemsMessageProps {
  icon: React.ReactNode;
  message: string;
}

export function NoItemsMessage({ icon, message }: NoItemsMessageProps) {
  return (
    <div className="text-center py-12 text-gray-500">
      {icon}
      <p className="text-lg">{message}</p>
    </div>
  );
}
