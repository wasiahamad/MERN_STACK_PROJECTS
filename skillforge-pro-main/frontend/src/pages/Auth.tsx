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
import { ApiClientError } from "@/lib/apiClient";

type AuthMode = "login" | "signup" | "verify-email-otp" | "forgot-password" | "reset-password";
type UserRole = "candidate" | "recruiter";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithPassword, signup, verifyEmailOtp, resendEmailOtp, forgotPassword, resetPassword, isAuthenticated, isRecruiter } =
    useAuth();
  const initialRole = (searchParams.get("role") as UserRole) || "candidate";
  
  const [mode, setMode] = useState<AuthMode>("signup");
  const [role, setRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

    try {
      if (mode === "login") {
        await loginWithPassword({ email: formData.email, password: formData.password });
        toast.success("Welcome back!", { description: "Logged in successfully" });
        return;
      }

      if (mode === "signup") {
        await signup({ email: formData.email, password: formData.password, role });
        toast.success("OTP sent", { description: `Check your inbox at ${formData.email}` });
        setMode("verify-email-otp");
        return;
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword({ email: formData.email });
      toast.success("Reset OTP sent", { description: `Check your inbox at ${formData.email}` });
      setMode("reset-password");
    } catch (err) {
      if (err instanceof ApiClientError) toast.error(err.message);
      else toast.error("Unable to send reset OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyEmailOtp({ email: formData.email, otp, name: formData.name || undefined });
      toast.success("Email verified", { description: "Your account is now active" });
    } catch (err) {
      if (err instanceof ApiClientError) toast.error(err.message);
      else toast.error("Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) return;
    try {
      await resendEmailOtp({ email: formData.email });
      toast.success("OTP resent", { description: `Sent again to ${formData.email}` });
    } catch (err) {
      if (err instanceof ApiClientError) toast.error(err.message);
      else toast.error("Unable to resend OTP");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email: formData.email, otp, newPassword });
      toast.success("Password updated", { description: "You can now login" });
      setMode("login");
      setOtp("");
      setNewPassword("");
      setFormData((p) => ({ ...p, password: "" }));
    } catch (err) {
      if (err instanceof ApiClientError) toast.error(err.message);
      else toast.error("Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setWalletConnecting(true);

    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.info("Wallet login not wired yet", {
      description: "Use email + OTP signup/login for now.",
      icon: <CheckCircle className="h-4 w-4 text-primary" />,
    });
    setWalletConnecting(false);
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
                  No worries! Enter your email and we'll send you a reset code (OTP).
                </p>

                <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary font-medium">
                    In development, the OTP may be logged in the backend console if email isn’t configured.
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
                    Send Reset Code
                    <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                </form>
              </motion.div>
            )}


            {/* Verify Email OTP View */}
            {mode === "verify-email-otp" && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setMode("signup")}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to signup
                </button>

                <h1 className="font-display text-2xl font-bold mb-2">Verify your email</h1>
                <p className="text-muted-foreground text-sm mb-6">
                  Enter the 6-digit OTP sent to <span className="font-medium text-foreground">{formData.email}</span>
                </p>

                <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                    />
                  </div>

                  <GradientButton type="submit" className="w-full" loading={loading}>
                    Verify & Continue
                    <ArrowRight className="h-4 w-4" />
                  </GradientButton>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </form>
              </motion.div>
            )}

            {/* Reset Password (OTP) View */}
            {mode === "reset-password" && (
              <motion.div
                key="reset"
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

                <h1 className="font-display text-2xl font-bold mb-2">Reset password</h1>
                <p className="text-muted-foreground text-sm mb-6">
                  Enter the OTP sent to <span className="font-medium text-foreground">{formData.email}</span>
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetOtp">OTP</Label>
                    <Input
                      id="resetOtp"
                      inputMode="numeric"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <GradientButton type="submit" className="w-full" loading={loading}>
                    Update Password
                    <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                </form>
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

                {/* Auth Hint */}
                <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary font-medium">
                    {mode === "login"
                      ? "Use your registered email/password. If you just signed up, verify the OTP first."
                      : "After signing up, you’ll receive an OTP to verify your email."}
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
