import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import Logo from "../Logo";
import LanguageSwitcher from "../LanguageSwitcher";
import Sidebar from "./Sidebar";
import ContextHeader from "./ContextHeader";
import { useAuth, useCompany } from "../../hooks/useAuth";

const DashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const company = useCompany();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hide ContextHeader on bookings pages
  const hideContextHeader = location.pathname.startsWith('/bookings');

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="fixed top-0 z-30 w-full border-b border-slate-200 bg-white">
        {/* Main Navbar */}
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left: Menu toggle + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <Logo to="/dashboard" />
          </div>

          {/* Right: User info + Language + Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right text-sm sm:block">
                <div className="font-semibold text-slate-900">{user.username}</div>
                {company && <div className="text-xs text-slate-500">{company.name}</div>}
              </div>
            )}
            <LanguageSwitcher />
            <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
              {t("nav.logout")}
            </Button>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:hidden"
              aria-label="Logout"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        {/* Context Header - Hidden on bookings pages */}
        {!hideContextHeader && <ContextHeader />}
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onShow={() => setSidebarOpen(true)} />

      {/* Main Content */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          hideContextHeader ? "pt-20" : "pt-24"
        } ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
