'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, GraduationCap, Shield, FileCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { signIn, useSession } from 'next-auth/react';

export default function LoginPage() {
  const { setIsLoggedIn } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { data: session, status } = useSession();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    if (email === 'admin@iitrpr.ac.in' && password === 'admin123') {
      toast.success('Login successful! Welcome back, Admin.');
      setIsLoggedIn(true);
      router.push('/dashboard');
    } else {
      toast.error('Invalid credentials. Try admin@iitrpr.ac.in / admin123');
      setErrors({ email: ' ', password: 'Invalid email or password' });
    }
  };


  return (
    <div className="min-h-screen flex bg-[#F8FAFC]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left Panel - Branded */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#1E3A8A] p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white p-1 flex items-center justify-center">
            <Image src="/logo.png" alt="IIT Ropar" width={56} height={56} className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Indian Institute of Technology
            </p>
            <p className="text-blue-300 text-sm">Ropar, Punjab — 140001</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-white text-4xl font-bold leading-tight mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Form Verification<br />Admin Portal
            </h1>
            <p className="text-blue-200 text-base leading-relaxed">
              Streamline document verification workflows across departments with a centralized admin platform built for IIT Ropar.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: <Shield size={20} />, title: 'Multi-level Verification', desc: 'Caretaker → HOD → Dean approval chain' },
              { icon: <FileCheck size={20} />, title: 'Dynamic Form Builder', desc: 'Create custom forms with drag-and-drop' },
              { icon: <GraduationCap size={20} />, title: 'Student Management', desc: 'Unified directory for all registered users' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-blue-400 text-xs">
            © 2025 IIT Ropar. All rights reserved. | <span className="italic">धियो यो नः प्रचोदयात्</span>
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] p-1 flex items-center justify-center">
              <Image src="/logo.png" alt="IIT Ropar" width={40} height={40} className="w-full h-full object-contain bg-white rounded-full" />
            </div>
            <div>
              <p className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>IIT Ropar</p>
              <p className="text-gray-500 text-xs">Form Portal Admin</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Admin Login
              </h2>
              <p className="text-gray-500 text-sm">Sign in to access the admin portal</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                  placeholder="admin@iitrpr.ac.in"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-gray-50 ${errors.email
                      ? 'border-red-400 focus:ring-red-200 bg-red-50'
                      : 'border-gray-200 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
                    }`}
                />
                {errors.email && errors.email !== ' ' && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button type="button" className="text-xs text-[#3B82F6] hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-2.5 pr-11 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-gray-50 ${errors.password
                        ? 'border-red-400 focus:ring-red-200 bg-red-50'
                        : 'border-gray-200 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#1E3A8A] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember Me</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={async () => {
                setGoogleLoading(true);
                await signIn("google", { callbackUrl: "/dashboard" }); // 👈 redirects to /dashboard after login
                setGoogleLoading(false);
              }}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Login with Google
                </>
              )}
            </button>
            <p className="text-center text-gray-400 text-xs mt-3 leading-relaxed">
              Google SSO currently enabled for frontend demo.<br />
              Backend handles standard auth.
            </p>

            <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-[#1E3A8A] font-medium">Demo Credentials</p>
              <p className="text-xs text-blue-600 mt-0.5">Email: admin@iitrpr.ac.in</p>
              <p className="text-xs text-blue-600">Password: admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
