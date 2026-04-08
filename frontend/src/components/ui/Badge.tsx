import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

export default function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const { theme } = useTheme();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors duration-300',
        theme === 'dark'
          ? 'border-white/10 bg-white/10 text-slate-200'
          : 'border-slate-300 bg-slate-100 text-slate-700'
      )}
      {...props}
    />
  );
}
