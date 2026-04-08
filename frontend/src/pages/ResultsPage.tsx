import { useEffect, useState } from 'react';
import type { Prediction } from '../types';
import { useParams } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import Layout from '../components/Layout';
import ProgressRing from '../components/ProgressRing';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const COLORS = ['#38bdf8', '#34d399', '#94a3b8'];

type SignalItem = {
  label: string;
  value: number;
  direction: 'increase_ai' | 'decrease_ai';
  rationale: string;
};

type RankedSignalItem = SignalItem & {
  impact: number;
};

export default function ResultsPage() {
  const { id } = useParams();
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<{ result: Prediction }>(`/results/${id}`)
      .then(({ data }) => setResult(data.result))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="rounded-[28px] border border-white/10 bg-white/8 p-8 text-sm text-slate-300">
          Loading result...
        </div>
      </Layout>
    );
  }

  if (!result) {
    return (
      <Layout>
        <Card>
          <CardHeader>
            <CardTitle>Result unavailable</CardTitle>
            <CardDescription>The prediction could not be loaded or has not been created yet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300">Upload a project and wait for the ML service to return a prediction.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/app/upload">Upload project</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/app/history">Go to history</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const aiProbability = result.aiProbability;
  const effortScore = result.effortScore;
  const feedback = result.explanation ?? result.feedback;
  const features = result.features;

  const pieData = [
    { name: 'AI probability', value: Math.round(aiProbability * 100) },
    { name: 'Human signal', value: 100 - Math.round(aiProbability * 100) },
  ];

  const barData = features
    ? [
        { metric: 'Complexity', value: Math.round(features.codeComplexity * 100) },
        { metric: 'Comments', value: Math.round(features.commentRatio * 100) },
        { metric: 'Repetition', value: Math.round(features.repetitionScore * 100) },
      ]
    : [];

  const interpretedSignals: RankedSignalItem[] = features
    ? (([
        {
          label: 'Repetition score',
          value: features.repetitionScore,
          direction: 'increase_ai',
          rationale: 'Higher repeated token patterns can indicate template-like generation.',
        },
        {
          label: 'Comment ratio',
          value: features.commentRatio,
          direction: 'decrease_ai',
          rationale: 'More comments can indicate manual reasoning and iterative development.',
        },
        {
          label: 'Code complexity',
          value: features.codeComplexity,
          direction: 'decrease_ai',
          rationale: 'More branching and control flow variation often reflects human edits.',
        },
        {
          label: 'Naming diversity',
          value: features.namingDiversity ?? 0,
          direction: 'decrease_ai',
          rationale: 'More varied naming tends to reduce AI-likeness in this model.',
        },
        {
          label: 'Function count density',
          value: features.functionCount ?? 0,
          direction: 'decrease_ai',
          rationale: 'Richer function structure can indicate handcrafted decomposition.',
        },
      ] as SignalItem[])
        .map((signal) => ({
          ...signal,
          impact: signal.direction === 'increase_ai' ? signal.value : 1 - signal.value,
        }))
        .sort((a, b) => b.impact - a.impact)
        .slice(0, 3))
    : [];

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calibrated AI probability</CardTitle>
            <CardDescription>
              {result.fileName}
              {' '}
              This score is an ML estimate from extracted code features, not a fixed truth value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span>Probability of AI generation</span>
                <span>{Math.round(aiProbability * 100)}%</span>
              </div>
              <progress
                className="h-3 w-full overflow-hidden rounded-full bg-white/10 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-sky-400 [&::-webkit-progress-value]:to-cyan-300"
                value={Math.round(aiProbability * 100)}
                max={100}
                aria-label="AI probability"
              />
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <ProgressRing value={effortScore} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model feedback</CardTitle>
              <CardDescription>
                Clear reviewer guidance produced by the pipeline.
                {result.modelVersion ? ` Model version: ${result.modelVersion}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-sky-500/12 to-emerald-500/12 p-6">
                <Badge className="mb-4">{result.predictionLabel ? `Prediction: ${result.predictionLabel}` : 'Generated insight'}</Badge>
                <p className="text-base leading-8 text-slate-100">{feedback}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signal breakdown</CardTitle>
              <CardDescription>View how the current evaluation is distributed.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="metric" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
                    <Bar dataKey="value" fill="#38bdf8" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {features ? (
            <Card>
              <CardHeader>
                <CardTitle>Why This Score</CardTitle>
                <CardDescription>
                  Top feature signals that influenced the current probability estimate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  {interpretedSignals.map((signal) => {
                    const pushesAiUp = signal.direction === 'increase_ai';
                    return (
                      <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <p className="text-sm font-medium text-slate-100">{signal.label}</p>
                          <Badge className={pushesAiUp ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'}>
                            {pushesAiUp ? 'Pushes AI score up' : 'Pushes AI score down'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300">{signal.rationale}</p>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                          <span>Observed value</span>
                          <span>{(signal.value * 100).toFixed(1)}%</span>
                        </div>
                        <progress
                          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-sky-400"
                          value={Math.max(0, Math.min(100, signal.value * 100))}
                          max={100}
                          aria-label={`${signal.label} value`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-200">Raw feature values</p>
                  <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                    <div>Complexity: {(features.codeComplexity * 100).toFixed(1)}%</div>
                    <div>Comments: {(features.commentRatio * 100).toFixed(1)}%</div>
                    <div>Repetition: {(features.repetitionScore * 100).toFixed(1)}%</div>
                    <div>Naming diversity: {((features.namingDiversity ?? 0) * 100).toFixed(1)}%</div>
                    <div>Function density: {((features.functionCount ?? 0) * 100).toFixed(1)}%</div>
                    <div>Avg line length: {((features.averageLineLength ?? 0) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
