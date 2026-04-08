import { Card, CardContent } from './ui/Card';

export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="group hover:-translate-y-1 transition-transform duration-300">
      <CardContent>
        <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/10 p-3 text-sky-200">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}
