'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { profile, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const target =
        profile.role === 'ADMIN' ? '/admin/' : profile.role === 'STAFF' ? '/staff/' : '/student/';
      router.replace(target);
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== target) {
          window.location.href = target;
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error, profile: loggedProfile } = await signIn(email, password);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success('Welcome back!');
      const activeUser = loggedProfile || profile;
      const targetRoute =
        activeUser?.role === 'ADMIN'
          ? '/admin/'
          : activeUser?.role === 'STAFF'
          ? '/staff/'
          : '/student/';

      router.replace(targetRoute);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== targetRoute) {
          window.location.href = targetRoute;
        }
      }, 300);
    } catch (err: any) {
      console.error('[Login] Error in handleSubmit:', err);
      toast.error(err?.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset link sent to your email');
      setResetMode(false);
    }
  };

  const fillAccount = (accountEmail: string, accountPass: string, demoKey?: string) => {
    setEmail(accountEmail);
    setPassword(accountPass);
    if (demoKey) setActiveDemo(demoKey);
  };

  const fillDemo = (type: 'student' | 'staff' | 'admin') => {
    const creds = {
      student: { email: '23ad001@sec.edu.in', password: 'student123' },
      staff: { email: 'shanthipriya@sec.edu.in', password: 'staff123' },
      admin: { email: 'sathishkumar@sec.edu.in', password: 'admin123' },
    };
    setEmail(creds[type].email);
    setPassword(creds[type].password);
    setActiveDemo(type);
  };

  return (
    <div className="relative min-h-screen h-[100dvh] w-full overflow-y-auto bg-gradient-to-br from-[#071326] via-[#0b1f3d] to-[#123B73] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none scrollbar-hide">
      {/* Ambient glowing orbs in the background */}
      <div className="absolute top-0 right-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none animate-pulse [animation-duration:8s]" />
      <div className="absolute bottom-10 left-10 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md my-auto animate-fade-in">
        {/* Glow border wrapper */}
        <div className="relative rounded-3xl bg-white/[0.97] backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] border border-white/60">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            {/* College Emblem Frame */}
            <div className="relative mb-3.5">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-md border border-slate-100 overflow-hidden">
                <img
                  src="/images/sec-logo.png"
                  alt="Sengunthar Engineering College Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-white shadow-xs">
                <span className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Institution Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50/90 border border-blue-200/70 mb-2">
              <Sparkles className="h-3 w-3 text-[#1468D5]" />
              <span className="text-[10.5px] font-bold tracking-wider uppercase text-[#1468D5]">
                Sengunthar Engineering College
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#0f172a]">
              {resetMode ? 'Reset Credentials' : 'SEC AI Portal'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-medium">
              {resetMode
                ? 'Enter your institutional email to recover access'
                : 'Autonomous · Anna University Affiliated · NAAC \'A\''}
            </p>
          </div>

          {!resetMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setActiveDemo(null);
                    }}
                    placeholder="student@sec.edu.in"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1468D5] focus:bg-white focus:ring-4 focus:ring-[#1468D5]/15 transition-all text-[#0f172a] placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-xs font-semibold text-[#1468D5] hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setActiveDemo(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-11 py-3 text-sm outline-none focus:border-[#1468D5] focus:bg-white focus:ring-4 focus:ring-[#1468D5]/15 transition-all text-[#0f172a] placeholder:text-slate-400 font-medium tracking-wide"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Unique Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1468D5] via-[#2563eb] to-[#0284c7] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60 overflow-hidden"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  Enter Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@sec.edu.in"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1468D5] focus:bg-white focus:ring-4 focus:ring-[#1468D5]/15 transition-all text-[#0f172a] placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1468D5] to-[#2563eb] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </button>
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-1"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {/* Quick Demo Access Section */}
          {!resetMode && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="h-px w-10 bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Demo Access
                </span>
                <span className="h-px w-10 bg-slate-200" />
              </div>

              {/* 3 Main Role Demo Cards */}
              <div className="grid grid-cols-3 gap-2">
                {/* Student */}
                <button
                  type="button"
                  onClick={() => fillDemo('student')}
                  className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 transition-all border text-center ${
                    activeDemo === 'student'
                      ? 'bg-blue-50/90 border-[#1468D5] shadow-sm ring-2 ring-[#1468D5]/20'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-blue-50/50 hover:border-blue-300'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1468D5] to-[#2563eb] text-white shadow-xs">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Student</span>
                  <span className="text-[10px] text-slate-500 truncate w-full font-medium">
                    Sanjay G
                  </span>
                </button>

                {/* Staff */}
                <button
                  type="button"
                  onClick={() => fillDemo('staff')}
                  className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 transition-all border text-center ${
                    activeDemo === 'staff'
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-emerald-50/50 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Staff</span>
                  <span className="text-[10px] text-slate-500 truncate w-full font-medium">
                    Shanthipriya
                  </span>
                </button>

                {/* Admin */}
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 transition-all border text-center ${
                    activeDemo === 'admin'
                      ? 'bg-rose-50/90 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-rose-50/50 hover:border-rose-300'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-xs">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Admin</span>
                  <span className="text-[10px] text-slate-500 truncate w-full font-medium">
                    Sathish K.
                  </span>
                </button>
              </div>

              {/* Other Demo Accounts */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 w-full text-center">
                  More accounts:
                </span>
                <button
                  type="button"
                  onClick={() => fillAccount('23ad009@sec.edu.in', 'student123', 'chandrika')}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all border ${
                    activeDemo === 'chandrika'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 border-slate-200/60 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  Chandrika (Student)
                </button>
                <button
                  type="button"
                  onClick={() => fillAccount('23ad010@sec.edu.in', 'student123', 'athul')}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all border ${
                    activeDemo === 'athul'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 border-slate-200/60 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  Athul (Student)
                </button>
                <button
                  type="button"
                  onClick={() => fillAccount('priyadharshini@sec.edu.in', 'staff123', 'priya')}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all border ${
                    activeDemo === 'priya'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 border-slate-200/60 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  Priyadharshini (Staff)
                </button>
                <button
                  type="button"
                  onClick={() => fillAccount('indhuja@sec.edu.in', 'staff123', 'indhuja')}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all border ${
                    activeDemo === 'indhuja'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 border-slate-200/60 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  Indhuja (Staff)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info below card */}
        <p className="text-center text-[11px] text-blue-200/60 mt-4 font-medium">
          Sengunthar Engineering College · Tiruchengode
        </p>
      </div>
    </div>
  );
}
