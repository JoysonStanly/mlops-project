import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Sparkles,
  BarChart3,
  UploadCloud,
  FolderKanban,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import FeatureCard from '../components/FeatureCard';
import { Card, CardContent } from '../components/ui/Card';

const features = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'AI project forensics',
    description:
      'Analyze code structure, repetition, and writing patterns to detect AI usage.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Secure authentication',
    description:
      'JWT-based login system with protected routes and safe data handling.',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Analytics dashboard',
    description:
      'Track AI probability, effort score, and submission history visually.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-6 py-6 mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-xl">
            <FolderKanban className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-lg font-semibold">AI Evaluator</p>
        </div>

        <nav className="hidden gap-8 text-sm md:flex text-slate-300">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
        </nav>

        <div className="flex gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      {/* HERO */}
      <main className="px-6 pt-16 pb-20 mx-auto max-w-7xl">

        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-full bg-sky-500/10 border-sky-400/20 text-sky-300">
              <CheckCircle2 className="w-4 h-4" />
              AI-powered academic evaluation
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-tight md:text-7xl">
              Detect AI Projects <br />
              <span className="text-transparent bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text">
                Instantly & Accurately
              </span>
            </h1>

            <p className="max-w-2xl mx-auto mt-6 text-lg text-slate-400">
              Upload student submissions, analyze AI usage, and generate insights
              with a powerful MLOps-based evaluation system.
            </p>

            <div className="flex justify-center gap-4 mt-8">
              <Button asChild>
                <Link to="/register">
                  Start Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button variant="secondary" asChild>
                <Link to="/login">View Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mt-28">
          <h2 className="text-3xl font-bold text-center">
            Powerful Features 🚀
          </h2>

          <div className="grid gap-6 mt-10 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 transition border rounded-2xl bg-white/5 border-white/10 hover:bg-white/10"
              >
                <div className="mb-4 text-sky-400">{feature.icon}</div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="workflow" className="grid gap-6 mt-28 md:grid-cols-3">
          {[
            ['Upload', 'Upload project files securely', UploadCloud],
            ['Analyze', 'AI model analyzes the project', Sparkles],
            ['Review', 'View results in dashboard', BarChart3],
          ].map(([title, desc, Icon]) => (
            <Card key={title as string} className="border bg-white/5 border-white/10">
              <CardContent>
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-sky-500/10 text-sky-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">{title as string}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {desc as string}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* CTA SECTION (NEW 🔥) */}
        <section className="mt-32 text-center">
          <div className="p-10 border rounded-3xl bg-gradient-to-r from-sky-500/10 to-emerald-500/10 border-white/10">
            <h2 className="text-3xl font-bold">
              Ready to Evaluate Smarter? 🚀
            </h2>
            <p className="mt-4 text-slate-400">
              Start detecting AI-generated projects today.
            </p>

            <div className="mt-6">
              <Button asChild>
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}