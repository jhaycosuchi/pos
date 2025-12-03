interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  colorClass: string;
}

export function ActionButton({ label, icon, onClick, colorClass }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full font-bold py-4 px-4 rounded-lg text-white transition-colors text-lg flex items-center justify-center gap-2 active:scale-95 ${colorClass}`}
    >
      {icon}
      {label}
    </button>
  );
}
