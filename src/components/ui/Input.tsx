import React from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<Props> = ({ className, ...rest }) => (
  <input
    className={clsx(
      "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400",
      className
    )}
    {...rest}
  />
);

export default Input;

