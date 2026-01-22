import React from "react";
import clsx from "clsx";

type Props = {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

const Card: React.FC<Props> = ({ children, className, title, subtitle, actions }) => {
  // Check if className contains background or border classes
  const hasCustomStyling = className && (className.includes('bg-') || className.includes('border-'));
  const defaultStyles = hasCustomStyling ? "" : "bg-white ring-slate-100";
  
  return (
    <div className={clsx("rounded-2xl p-6 shadow-soft ring-1", defaultStyles, className)}>
      {(title || subtitle || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

