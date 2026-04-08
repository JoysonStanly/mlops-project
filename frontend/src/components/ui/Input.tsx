import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  const { theme } = useTheme();
  
  return (
    <input
      className={cn(
        'w-full rounded-2xl border px-4 py-3 text-sm shadow-inner outline-none backdrop-blur-md transition focus:ring-2 focus:ring-sky-400/20',
        theme === 'dark'
          ? 'border-white/10 bg-white/6 text-white placeholder:text-slate-400 shadow-black/20 focus:border-sky-400/40'
          : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-slate-100 focus:border-sky-400 focus:ring-sky-400/20'
      )}
      {...props}
    />
  );
}
