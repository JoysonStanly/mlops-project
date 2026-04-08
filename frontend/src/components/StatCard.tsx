import { Card, CardContent, CardDescription, CardTitle } from './ui/Card';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export default function StatCard({
  title,
  value,
  delta,
  accent,
}: {
  title: string;
  value: string;
  delta: string;
  accent: string;
}) {
  const { theme } = useTheme();
  return (
    <Card className="relative overflow-hidden">
      <div className={cn(`absolute inset-0 bg-gradient-to-br ${accent}`, theme === 'dark' ? 'opacity-20' : 'opacity-10')} />
      <CardContent className="relative">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
        <p className={cn('mt-3 text-sm', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>{delta}</p>
      </CardContent>
    </Card>
  );
}
