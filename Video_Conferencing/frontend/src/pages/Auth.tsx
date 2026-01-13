import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, Video } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login.mutateAsync({
          email: formData.email,
          password: formData.password
        });
      } else {
        await register.mutateAsync({
          username: formData.username,
          password: formData.password,
          email: formData.email,
        });
      }
    } catch (err) {
      // Error handled by hook/toast
      console.error(err);
    }
  };

  const isLoading = login.isPending || register.isPending;
  const error = login.error || register.error;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col justify-center p-12 relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-900/20" />
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white mb-8 shadow-2xl shadow-primary/30">
            <Video className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-6 text-white leading-tight">
            Connect with your team like never before.
          </h1>
          <p className="text-lg text-gray-400">
            Crystal clear video, instant screen sharing, and seamless collaboration tools designed for modern teams.
          </p>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin ? "Enter your credentials to access your account" : "Get started with your free account today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Email</label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </>
            )}

            {isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Email</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Username</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Password</label>
              <input
                required
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Please wait...
                </>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
