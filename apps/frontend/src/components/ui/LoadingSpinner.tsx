import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZES = {
  sm: 'h-4 w-4 border',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-2',
};

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)} role="status">
      <div
        className={cn(
          'animate-spin rounded-full border-primary-600 border-t-transparent',
          SIZES[size],
        )}
      />
      {label && <span className="ml-3 text-sm text-muted-foreground">{label}</span>}
      <span className="sr-only">{label || 'Chargement…'}</span>
    </div>
  );
}
