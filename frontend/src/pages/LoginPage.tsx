import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/app');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#050b15] text-white">

      {/* LEFT SIDE */}
      <motion.section
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-center p-12 
        bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_40%),linear-gradient(180deg,#020617_0%,#020617_100%)]"
      >
        <div>
          <p className="text-sky-400 tracking-[0.4em] text-sm uppercase">
            AI Project Evaluator
          </p>

          <h1 className="mt-6 text-5xl font-bold leading-tight">
            Evaluate Projects <br /> with AI Precision 🚀
          </h1>

          <p className="max-w-md mt-6 text-lg text-slate-400">
            Upload projects, detect AI usage, and generate insights with a
            modern MLOps workflow platform.
          </p>
        </div>
      </motion.section>

      {/* RIGHT SIDE */}
      <section className="flex items-center justify-center p-6">

        <motion.form
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md p-8 rounded-3xl 
          bg-white/5 border border-white/10 
          backdrop-blur-2xl shadow-[0_0_40px_rgba(56,189,248,0.15)]"
        >
          {/* HEADER */}
          <div className="text-center">
            <h2 className="text-3xl font-bold">Welcome Back 👋</h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to continue
            </p>
          </div>

          {/* FORM */}
          <div className="mt-8 space-y-5">

            {/* EMAIL */}
            <Input
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* PASSWORD */}
            <div className="relative">
              <Input
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="accent-sky-400"
                />
                Remember me
              </label>

              <Link to="/forgot" className="text-sky-400 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* ERROR */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 text-sm text-red-300 border bg-red-500/10 border-red-500/20 rounded-xl"
              >
                {error}
              </motion.p>
            )}

            {/* BUTTON */}
            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>

          {/* FOOTER */}
          <p className="mt-6 text-sm text-center text-slate-400">
            Don’t have an account?{' '}
            <Link to="/register" className="text-sky-400 hover:underline">
              Sign up
            </Link>
          </p>
        </motion.form>
      </section>
    </div>
  );
}