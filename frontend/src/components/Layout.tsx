import { Sun, Moon, ChevronRight, FolderOpen, LayoutDashboard, LogOut, Upload, History } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/upload', label: 'Upload', icon: Upload },
  { to: '/app/history', label: 'History', icon: History },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-300',
        theme === 'dark'
          ? 'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.1),_transparent_24%),linear-gradient(180deg,#06111f_0%,#091322_100%)] text-white'
          : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900',
      )}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 p-4 md:p-6">
        <aside
          className={cn(
            'hidden w-72 flex-col rounded-[28px] border p-5 shadow-glow backdrop-blur-2xl lg:flex transition-colors duration-300',
            theme === 'dark' ? 'border-white/10 bg-white/8' : 'border-slate-200 bg-white',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-4 transition-colors duration-300',
              theme === 'dark' ? 'border-white/10 bg-white/6' : 'border-slate-200 bg-sky-50',
            )}
          >
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-300',
                theme === 'dark' ? 'bg-sky-400/20 text-sky-200' : 'bg-sky-100 text-sky-600',
              )}
            >
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>AI Project Evaluator</p>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>MLOps evaluation suite</p>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition',
                    active
                      ? theme === 'dark'
                        ? 'bg-white text-slate-950 shadow-lg shadow-sky-500/10'
                        : 'bg-sky-100 text-sky-900 shadow-lg shadow-sky-200'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-white/8 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </NavLink>
              );
            })}
          </nav>

          <div
            className={cn(
              'mt-auto rounded-[24px] border p-4 transition-colors duration-300',
              theme === 'dark'
                ? 'border-white/10 bg-gradient-to-br from-sky-500/20 to-emerald-500/10'
                : 'border-sky-200 bg-gradient-to-br from-sky-50 to-emerald-50',
            )}
          >
            <p className={cn('text-sm font-medium', theme === 'dark' ? 'text-slate-200' : 'text-slate-700')}>Signed in as</p>
            <p className={cn('mt-1 text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>{user?.name}</p>
            <p className={cn('text-xs', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>{user?.email}</p>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          <header
            className={cn(
              'mb-6 flex items-center justify-between rounded-[28px] border px-5 py-4 backdrop-blur-2xl transition-colors duration-300',
              theme === 'dark' ? 'border-white/10 bg-white/8' : 'border-slate-200 bg-white',
            )}
          >
            <div>
              <p className={cn('text-xs uppercase tracking-[0.35em]', theme === 'dark' ? 'text-sky-300' : 'text-sky-600')}>Premium MLOps SaaS</p>
              <h1 className={cn('mt-1 text-xl font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>AI Project Evaluator</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={cn(
                  'rounded-2xl border p-3 transition hover:scale-110',
                  theme === 'dark'
                    ? 'border-white/10 bg-white/8 text-slate-200 hover:bg-white/12'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
                aria-label="Toggle theme"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <div
                className={cn(
                  'rounded-2xl border px-4 py-2 text-sm transition-colors duration-300',
                  theme === 'dark' ? 'border-white/10 bg-white/8 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700',
                )}
              >
                {user?.name}
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
