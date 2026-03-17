import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Shield } from "lucide-react";
import logo from "@/assets/iit-ropar-logo.png";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Gradient Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white animate-pulse" />
          <div className="absolute bottom-32 right-20 w-48 h-48 rounded-full bg-white animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 text-center px-12">
          <img src={logo} alt="IIT Ropar" className="mx-auto mb-6 h-28 w-28 object-contain rounded-2xl bg-white/20 p-3" />
          <h2 className="font-heading text-3xl font-bold text-white mb-3">
            Centralized Forms Portal
          </h2>
          <p className="text-white/70 text-sm max-w-sm mx-auto leading-relaxed">
            Submit, track, and manage all institutional forms digitally. A modern solution for IIT Ropar.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-white/50 text-xs">
            <Shield className="h-4 w-4" />
            <span>Secure & Encrypted</span>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <img src={logo} alt="IIT Ropar" className="mx-auto mb-4 h-20 w-20 object-contain" />
            <h1 className="font-heading text-2xl font-bold text-gradient">
              Centralized Forms Portal
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Indian Institute of Technology Ropar
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to access your forms portal</p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@iitrpr.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <Separator className="flex-1" />
            </div>

            <Button variant="outline" className="w-full h-11 rounded-xl" disabled>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Indian Institute of Technology Ropar
          </p>
        </motion.div>
      </div>
    </div>
  );
}
