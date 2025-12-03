import { Check } from 'lucide-react';

interface CompletedItemsSectionProps {
  count: number;
}

export function CompletedItemsSection({ count }: CompletedItemsSectionProps) {
  if (count === 0) return null;

  return (
    <div className="my-3 py-2 border-t border-dashed border-gray-300 text-center text-sm text-gray-600 font-bold">
      <Check className="h-5 w-5 inline mr-1" />
      COMPLETADOS ({count})
    </div>
  );
}
