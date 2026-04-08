import { cloneElement, isValidElement } from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  asChild?: boolean;
};

export default function Button({ className, variant = 'primary', asChild, ...props }: ButtonProps) {
  const { theme } = useTheme();
  
  const styles = cn(
    'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/60 disabled:cursor-not-allowed disabled:opacity-60',
    variant === 'primary' && (theme === 'dark'
      ? 'bg-white text-slate-950 shadow-lg shadow-sky-500/10 hover:-translate-y-0.5'
      : 'bg-sky-600 text-white shadow-lg shadow-sky-400/30 hover:bg-sky-700 hover:-translate-y-0.5'
    ),
    variant === 'secondary' && (theme === 'dark'
      ? 'bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15'
      : 'bg-slate-200 text-slate-900 ring-1 ring-slate-300 hover:bg-slate-300'
    ),
    variant === 'ghost' && (theme === 'dark'
      ? 'bg-transparent text-slate-200 hover:bg-white/10'
      : 'bg-transparent text-slate-700 hover:bg-slate-100'
    ),
    className,
  );

  if (asChild) {
    const { children, ...rest } = props;
    if (isValidElement(children)) {
      return cloneElement(children, {
        ...rest,
        className: cn(styles, children.props.className),
      });
    }
    return <span className={styles}>{children}</span>;
  }

  return <button className={styles} {...props} />;
}
