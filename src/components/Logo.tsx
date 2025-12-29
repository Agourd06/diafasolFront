import React from "react";
import { APP_NAME } from "../utils/constants";
import { Link } from "react-router-dom";

type Props = {
  to?: string;
};

const Logo: React.FC<Props> = ({ to = "/" }) => (
  <Link to={to} className="flex items-center gap-2 font-semibold text-brand-700">
    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-soft">
      DS
    </span>
    <div className="flex flex-col leading-tight">
      <span className="text-base">{APP_NAME}</span>
      <span className="text-xs text-slate-500">Boutique Tourism</span>
    </div>
  </Link>
);

export default Logo;

