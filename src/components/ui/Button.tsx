import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  isLoading?: boolean;
};

const base =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft",
  ghost: "text-slate-700 hover:bg-slate-100",
  outline:
    "border border-slate-300 text-slate-800 hover:bg-slate-50 focus-visible:outline-brand-500"
};

const Button: React.FC<Props> = ({
  children,
  className,
  variant = "primary",
  isLoading,
  disabled,
  ...rest
}) => (
  <button
    className={clsx(base, variants[variant], className)}
    disabled={disabled || isLoading}
    {...rest}
  >
    {isLoading && (
      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
    )}
    {children}
  </button>
);

export default Button;

