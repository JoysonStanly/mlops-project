import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import type { Prediction } from '../types';

export default function DashboardPage() {
  const [history, setHistory] = useState<Prediction[]>([]);

  useEffect(() => {
    api
      .get<{ predictions: Prediction[] }>('/history')
      .then(({ data }) => setHistory(data.predictions ?? []))
      .catch(() => setHistory([]));
  }, []);

  const totalProjects = history.length;
  const averageAiProbability = totalProjects
    ? history.reduce((sum, item) => sum + item.aiProbability, 0) / totalProjects
    : 0;
  const reviewedToday = history.filter((item) => {
    const createdAt = new Date(item.createdAt);
    const today = new Date();
    return createdAt.toDateString() === today.toDateString();
  }).length;

  const trendData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dayKey = date.toDateString();
    const label = date.toLocaleDateString('en-US', { weekday: 'short' });
    const value = history.filter((item) => new Date(item.createdAt).toDateString() === dayKey).length;
    return { label, value };
  });

  return (
    <Layout>
      <div className="grid gap-5 lg:grid-cols-3">
        <StatCard title="Projects evaluated" value={String(totalProjects)} delta={totalProjects ? 'Loaded from your saved evaluations' : 'No uploads yet'} accent="from-sky-500 to-cyan-500" />
        <StatCard title="AI likelihood avg" value={`${Math.round(averageAiProbability * 100)}%`} delta={totalProjects ? 'Average across your submissions' : 'No probability data yet'} accent="from-emerald-500 to-teal-500" />
        <StatCard title="Reviewed today" value={String(reviewedToday)} delta={reviewedToday ? 'Evaluations created today' : 'No reviews created today'} accent="from-indigo-500 to-sky-500" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Evaluation trends</CardTitle>
            <CardDescription>Upload volume collected over the last seven days.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
                <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#trendFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump straight to the most common evaluation flows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <Link to="/app/upload">Upload new project</Link>
            </Button>
            <Button variant="secondary" className="w-full" asChild>
              <Link to="/app/history">Review history</Link>
            </Button>
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm text-slate-300">
              Your dashboard will populate as soon as you upload projects and save evaluations.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent predictions</CardTitle>
          <CardDescription>A live summary of the latest uploaded projects.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {history.length ? (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-4 font-medium">File</th>
                  <th className="pb-4 font-medium">AI probability</th>
                  <th className="pb-4 font-medium">Effort score</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((item) => (
                  <tr key={item.id} className="border-t border-white/8">
                    <td className="py-4 text-slate-200">{item.fileName}</td>
                    <td className="py-4 text-slate-300">{Math.round(item.aiProbability * 100)}%</td>
                    <td className="py-4 text-slate-300">{Math.round(item.effortScore)}/100</td>
                    <td className="py-4 text-emerald-300">{item.status ?? 'completed'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/6 p-8 text-sm text-slate-400">
              No predictions yet. Upload a project to start building your history.
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
