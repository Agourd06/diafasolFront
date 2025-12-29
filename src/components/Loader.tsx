import React from "react";
import clsx from "clsx";

type Props = {
  className?: string;
  label?: string;
};

const Loader: React.FC<Props> = ({ className, label }) => (
  <div className={clsx("flex items-center justify-center gap-3 text-sm text-slate-600", className)}>
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    {label ?? "Loading..."}
  </div>
);

export default Loader;

