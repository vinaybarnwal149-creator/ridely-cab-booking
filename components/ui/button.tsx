import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "pill";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary: "bg-[#000000] text-[#ffffff] hover:bg-[#333333] active:bg-[#000000] rounded-[8px]",
      pill: "bg-[#ffffff] text-[#000000] hover:bg-[#f6f6f6] rounded-full border border-[#000000]",
      secondary: "bg-[#f6f6f6] text-[#000000] hover:bg-[#e2e2e2] rounded-[8px]",
      outline: "border border-[#767676] bg-[#ffffff] text-[#000000] hover:bg-[#f6f6f6] rounded-[8px]",
      ghost: "text-[#000000] hover:bg-[#f6f6f6] rounded-[8px]",
      danger: "bg-[#000000] text-[#ffffff] hover:bg-[#333333] rounded-[8px]",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-4 text-sm",
      lg: "h-13 px-6 text-base font-medium",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
