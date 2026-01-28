import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = "primary", size = "default", loading = false, children, disabled, ...props }, ref) => {
    const baseClasses = cn(
      "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-300",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      {
        // Primary gradient
        "gradient-primary text-primary-foreground shadow-lg hover:shadow-glow": variant === "primary",
        // Accent gradient
        "gradient-accent text-accent-foreground shadow-lg": variant === "accent",
        // Outline
        "border-2 border-primary bg-transparent text-primary hover:bg-primary/10": variant === "outline",
        // Ghost
        "bg-transparent hover:bg-primary/10 text-foreground": variant === "ghost",
        // Sizes
        "h-10 px-6 text-sm": size === "default",
        "h-9 px-4 text-xs": size === "sm",
        "h-12 px-8 text-base": size === "lg",
        "h-10 w-10": size === "icon",
      },
      className
    );

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </motion.div>
        )}
        <span className={cn(loading && "opacity-0")}>{children}</span>
      </motion.button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export { GradientButton };
