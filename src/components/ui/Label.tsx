import React from "react";
import clsx from "clsx";

type Props = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label: React.FC<Props> = ({ className, children, ...rest }) => (
  <label className={clsx("text-sm font-medium text-slate-700", className)} {...rest}>
    {children}
  </label>
);

export default Label;

