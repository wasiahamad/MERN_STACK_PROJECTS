import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Briefcase, Mail, Lock, User, Building2, ArrowRight, Wallet, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type AuthMode = "login" | "signup" | "forgot-password" | "reset-sent";
type UserRole = "candidate" | "recruiter";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, isRecruiter } = useAuth();
  const initialRole = (searchParams.get("role") as UserRole) || "candidate";
  
  const [mode, setMode] = useState<AuthMode>("signup");
  const [role, setRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isRecruiter ? "/recruiter/dashboard" : "/dashboard");
    }
  }, [isAuthenticated, isRecruiter, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo login
    login(role);
    
    toast.success(
      mode === "login" ? "Welcome back!" : "Account created successfully!",
      {
        description: `Logged in as ${role === "candidate" ? "Candidate" : "Recruiter"}`,
      }
    );
    
    setLoading(false);
    
    // Redirect based on role
    if (role === "candidate") {
      navigate("/dashboard");
    } else {
      navigate("/recruiter/dashboard");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending reset email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Reset link sent!", {
      description: `Check your inbox at ${formData.email}`,
    });
    
    setLoading(false);
    setMode("reset-sent");
  };

  const handleWalletConnect = async () => {
    setWalletConnecting(true);
    
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Demo wallet login
    login(role);
    
    toast.success("Wallet Connected!", {
      description: "0x1234...5678 connected successfully",
      icon: <CheckCircle className="h-4 w-4 text-primary" />,
    });
    
    setWalletConnecting(false);
    
    // Redirect based on role
    if (role === "candidate") {
      navigate("/dashboard");
    } else {
      navigate("/recruiter/dashboard");
    }
  };

  // Don't render if redirecting
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary"
          >
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <span className="font-display text-2xl font-bold">
            Chain<span className="gradient-text">Hire</span>
          </span>
        </Link>

        <GlassCard hover={false} className="p-8">
          <AnimatePresence mode="wait">
            {/* Forgot Password View */}
            {mode === "forgot-password" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setMode("login")}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </button>

                <h1 className="font-display text-2xl font-bold mb-2">
                  Forgot Password?
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                  No worries! Enter your email and we'll send you a reset link.
                </p>

                <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary font-medium">
                    🎮 Demo Mode: Enter any email to simulate reset
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <GradientButton type="submit" className="w-full" loading={loading}>
                    Send Reset Link
                    <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                </form>
              </motion.div>
            )}

            {/* Reset Sent Confirmation View */}
            {mode === "reset-sent" && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>

                <h1 className="font-display text-2xl font-bold mb-2">
                  Check Your Email
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                  We've sent a password reset link to <br />
                  <span className="font-medium text-foreground">{formData.email}</span>
                </p>

                <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary font-medium">
                    🎮 Demo Mode: No actual email sent. Click below to continue.
                  </p>
                </div>

                <GradientButton
                  onClick={() => {
                    toast.success("Password reset successful!", {
                      description: "You can now login with your new password",
                    });
                    setMode("login");
                  }}
                  className="w-full mb-4"
                >
                  <CheckCircle className="h-4 w-4" />
                  Simulate Password Reset
                </GradientButton>

                <button
                  onClick={() => setMode("login")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to login
                </button>
              </motion.div>
            )}

            {/* Login/Signup View */}
            {(mode === "login" || mode === "signup") && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Role Toggle */}
                <div className="flex rounded-xl bg-muted p-1 mb-6">
                  {[
                    { id: "candidate" as UserRole, label: "Candidate", icon: User },
                    { id: "recruiter" as UserRole, label: "Recruiter", icon: Building2 },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setRole(item.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all",
                        role === item.id
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setMode("login")}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      mode === "login" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      mode === "signup" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Sign Up
                  </button>
                </div>

                <h1 className="font-display text-2xl font-bold mb-2">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                  {mode === "login"
                    ? "Enter your credentials to access your account"
                    : `Sign up as a ${role} to get started`}
                </p>

                {/* Demo Credentials Hint */}
                <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary font-medium">
                    🎮 Demo Mode: Enter any email/password to login
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {role === "recruiter" ? "Company Name" : "Full Name"}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder={role === "recruiter" ? "Acme Inc." : "John Doe"}
                          className="pl-10"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => setMode("forgot-password")}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <GradientButton type="submit" className="w-full" loading={loading}>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <GradientButton 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleWalletConnect}
                  loading={walletConnecting}
                >
                  <Wallet className="h-4 w-4" />
                  {walletConnecting ? "Connecting..." : "Connect Wallet"}
                </GradientButton>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="text-primary hover:underline font-medium"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
};

export default Auth;
