import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { theme } = useTheme();
  return (
    <div
      className={cn(
        'rounded-3xl border backdrop-blur-xl shadow-glow transition-colors duration-300',
        theme === 'dark'
          ? 'border-white/10 bg-white/8'
          : 'border-slate-200 bg-white/70',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { theme } = useTheme();
  return (
    <div
      className={cn(
        'border-b px-6 py-5 transition-colors duration-300',
        theme === 'dark' ? 'border-white/10' : 'border-slate-200',
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { theme } = useTheme();
  return (
    <h3
      className={cn(
        'text-lg font-semibold transition-colors duration-300',
        theme === 'dark' ? 'text-white' : 'text-slate-900',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { theme } = useTheme();
  return (
    <p
      className={cn(
        'mt-1 text-sm transition-colors duration-300',
        theme === 'dark' ? 'text-slate-400' : 'text-slate-600',
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}
