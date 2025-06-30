import { Table } from 'lucide-react';

interface TableButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}

export function TableButton({ 
  onClick, 
  disabled = false, 
  title = "Open feature table",
  className = ""
}: TableButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={title}
    >
      <Table className="h-4 w-4" />
    </button>
  );
} 