'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, GraduationCap, Users, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { profile, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useState(() => {
    // If already logged in, redirect immediately
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Welcome back!');
    if (profile) {
      const route = profile.role === 'ADMIN' ? '/admin' : profile.role === 'STAFF' ? '/staff' : '/student';
      router.replace(route);
    } else {
      router.replace('/');
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

  const fillAccount = (accountEmail: string, accountPass: string) => {
    setEmail(accountEmail);
    setPassword(accountPass);
  };

  const fillDemo = (type: 'student' | 'staff' | 'admin') => {
    const creds = {
      student: { email: '23ad001@sec.edu.in', password: 'student123' },
      staff: { email: 'shanthipriya@sec.edu.in', password: 'staff123' },
      admin: { email: 'sathishkumar@sec.edu.in', password: 'admin123' },
    };
    setEmail(creds[type].email);
    setPassword(creds[type].password);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FBFF]">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#123B73] via-[#1468D5] to-[#0d4a9e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-md shrink-0 overflow-hidden">
              <img src="/images/sec-logo.png" alt="Sengunthar Engineering College Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-lg">SEC AI Assistant</p>
              <p className="text-sm text-white/80">Sengunthar Engineering College</p>
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">Your AI College Companion</h1>
            <p className="text-lg text-white/80 max-w-md">
              Attendance, marks, placements, announcements, and AI-powered assistance — all in one secure platform.
            </p>
            <div className="space-y-3 pt-4">
              {[
                'AI-powered college assistant for students',
                'Staff & admin management portals',
                'Secure, role-based access control',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/90">{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/50">Tiruchengode, Tamil Nadu</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 p-1 shadow-sm shrink-0 overflow-hidden">
              <img src="/images/sec-logo.png" alt="SEC Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-[#172033]">SEC AI Assistant</p>
              <p className="text-xs text-[#6B7280]">Sengunthar Engineering College</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#172033] mb-1">
            {resetMode ? 'Reset Password' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-[#6B7280] mb-6">
            {resetMode ? 'Enter your email to receive a reset link' : 'Sign in to your account to continue'}
          </p>

          {!resetMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@sec.edu.in"
                  className="w-full rounded-xl border border-[#E6EEF7] bg-white px-4 py-3 text-sm outline-none focus:border-[#1468D5] focus:ring-2 focus:ring-[#1468D5]/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#E6EEF7] bg-white px-4 py-3 pr-11 text-sm outline-none focus:border-[#1468D5] focus:ring-2 focus:ring-[#1468D5]/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#172033]"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setResetMode(true)} className="text-sm text-[#1468D5] hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1468D5] px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#123B73] transition-all disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@sec.edu.in"
                  className="w-full rounded-xl border border-[#E6EEF7] bg-white px-4 py-3 text-sm outline-none focus:border-[#1468D5] focus:ring-2 focus:ring-[#1468D5]/20 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1468D5] px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#123B73] transition-all disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                Send Reset Link
              </button>
              <button type="button" onClick={() => setResetMode(false)} className="w-full text-sm text-[#6B7280] hover:text-[#172033]">
                Back to sign in
              </button>
            </form>
          )}

          {!resetMode && (
            <div className="mt-8 border-t border-[#E6EEF7] pt-6">
              <p className="text-xs font-medium text-[#6B7280] mb-3 text-center">Quick demo access</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => fillDemo('student')}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[#E6EEF7] bg-white px-3 py-3 hover:border-[#1468D5] hover:bg-[#F8FBFF] transition-all"
                >
                  <GraduationCap className="h-5 w-5 text-[#1468D5]" />
                  <span className="text-xs font-medium text-[#172033]">Student</span>
                  <span className="text-[10px] text-[#6B7280]">Sanjay G</span>
                </button>
                <button
                  onClick={() => fillDemo('staff')}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[#E6EEF7] bg-white px-3 py-3 hover:border-[#1468D5] hover:bg-[#F8FBFF] transition-all"
                >
                  <Users className="h-5 w-5 text-[#1468D5]" />
                  <span className="text-xs font-medium text-[#172033]">Staff</span>
                  <span className="text-[10px] text-[#6B7280]">Shanthipriya</span>
                </button>
                <button
                  onClick={() => fillDemo('admin')}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[#E6EEF7] bg-white px-3 py-3 hover:border-[#1468D5] hover:bg-[#F8FBFF] transition-all"
                >
                  <ShieldCheck className="h-5 w-5 text-[#1468D5]" />
                  <span className="text-xs font-medium text-[#172033]">Admin</span>
                  <span className="text-[10px] text-[#6B7280]">Sathish Kumar</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-[#F0F4F8]">
                <span className="text-[10px] text-[#6B7280] w-full text-center mb-0.5">More demo accounts:</span>
                <button
                  type="button"
                  onClick={() => fillAccount('23ad009@sec.edu.in', 'student123')}
                  className="rounded-lg bg-[#F1F5F9] px-2 py-1 text-[11px] font-medium text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors"
                >
                  Chandrika
                </button>
                <button
                  type="button"
                  onClick={() => fillAccount('23ad010@sec.edu.in', 'student123')}
                  className="rounded-lg bg-[#F1F5F9] px-2 py-1 text-[11px] font-medium text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors"
                >
                  Athul
                </button>
                <button
                  type="button"
                  onClick={() => fillAccount('priyadharshini@sec.edu.in', 'staff123')}
                  className="rounded-lg bg-[#F1F5F9] px-2 py-1 text-[11px] font-medium text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors"
                >
                  Priyadharshini
                </button>
                <button
                  type="button"
                  onClick={() => fillAccount('indhuja@sec.edu.in', 'staff123')}
                  className="rounded-lg bg-[#F1F5F9] px-2 py-1 text-[11px] font-medium text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors"
                >
                  Indhuja
                </button>
              </div>
              <p className="text-[10px] text-[#6B7280] text-center mt-3">
                Click any account to pre-fill credentials for testing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
