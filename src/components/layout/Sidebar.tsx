import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onShow?: () => void;
};

interface SubMenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[]; // Allow nested sub-items
}

interface NavItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubMenuItem[];
}

const Sidebar: React.FC<Props> = ({ isOpen, onToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(null);

  const navItems: NavItem[] = [
    // 1. Channel Manager
    {
      title: t("sidebar.channelManager", { defaultValue: "Channel Manager" }),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: "/dashboard",
    },
    // 2. Paramètres (Settings) with all sub-items
    {
      title: t("sidebar.settings", { defaultValue: "Paramètres" }),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      subItems: [
        {
          title: t("properties.title"),
          path: "/properties",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          title: t("roomTypes.title"),
          path: "/room-types",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
        {
          title: t("ratePlans.title"),
          path: "/rate-plans",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          title: t("taxes.title"),
          path: "/taxes",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ),
          subItems: [
            {
              title: t("taxSets.title"),
              path: "/tax-sets",
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              title: t("taxApplicableDateRanges.title"),
              path: "/tax-applicable-date-ranges",
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            },
          ],
        },
        {
          title: t("reservationPolicies.title"),
          path: "",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          subItems: [
            {
              title: t("reservationAdvancePolicies.title"),
              path: "/reservation-advance-policies",
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
            },
            {
              title: t("reservationAdvancePolicyDateRanges.title"),
              path: "/reservation-advance-policy-date-ranges",
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              title: t("reservationCancellationPolicies.title"),
              path: "/reservation-cancellation-policies",
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: t("reservationCancellationPolicyDateRanges.title"),
              path: "/reservation-cancellation-policy-date-ranges",
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            },
          ],
        },
        {
          title: t("facilities.title"),
          path: "/facilities",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          ),
        },
        {
          title: t("operators.title"),
          path: "/companies",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
      ],
    },
    // 3. Bookings (Menu)
    {
      title: t("bookings.title", { defaultValue: "Bookings" }),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: "/bookings",
    },
    // 4. Room Search
    {
      title: t("roomSearch.title", { defaultValue: "Room Search" }),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      path: "/room-search",
    },
  ];

  const toggleMenu = (title: string) => {
    setExpandedMenu(expandedMenu === title ? null : title);
  };

  const toggleSubMenu = (title: string) => {
    setExpandedSubMenu(expandedSubMenu === title ? null : title);
  };

  const isSubItemActive = (subItems?: SubMenuItem[]): boolean => {
    if (!subItems) return false;
    return subItems.some(sub => {
      if (location.pathname.startsWith(sub.path) && sub.path) return true;
      if (sub.subItems) return isSubItemActive(sub.subItems);
      return false;
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900">{t("sidebar.title")}</h2>
            <p className="text-xs text-slate-500">{t("sidebar.subtitle")}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <div key={item.path || item.title}>
                  {item.subItems ? (
                    // Menu with sub-items (collapsible)
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isSubItemActive(item.subItems)
                            ? "bg-brand-50 text-brand-700"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            expandedMenu === item.title ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Main item link */}
                      {item.path && (
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              expandedMenu === item.title ? "block" : "hidden"
                            } ${
                              isActive
                                ? "bg-brand-100 text-brand-800 ml-6"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 ml-6"
                            }`
                          }
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>{t("common.viewAll")}</span>
                        </NavLink>
                      )}

                      {/* Sub-items */}
                      {expandedMenu === item.title && (
                        <div className="ml-6 space-y-1 border-l-2 border-slate-200 pl-3">
                          {item.subItems.map((subItem) => (
                            <div key={subItem.path || subItem.title}>
                              {subItem.subItems ? (
                                // Sub-item with nested items (sub-sub-menu)
                                <div className="space-y-1">
                                  <button
                                    onClick={() => toggleSubMenu(subItem.title)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                      isSubItemActive(subItem.subItems)
                                        ? "bg-brand-50 text-brand-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {subItem.icon}
                                      <span>{subItem.title}</span>
                                    </div>
                                    <svg
                                      className={`h-3 w-3 transition-transform ${
                                        expandedSubMenu === subItem.title ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>

                                  {/* Sub-sub-items */}
                                  {expandedSubMenu === subItem.title && (
                                    <div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-3">
                                      {subItem.subItems.map((nestedItem) => (
                                        <NavLink
                                          key={nestedItem.path}
                                          to={nestedItem.path}
                                          className={({ isActive }) =>
                                            `flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                              isActive
                                                ? "bg-brand-100 text-brand-800"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`
                                          }
                                        >
                                          {nestedItem.icon}
                                          <span>{nestedItem.title}</span>
                                        </NavLink>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                // Simple sub-item (no nested items)
                                <NavLink
                                  to={subItem.path}
                                  className={({ isActive }) =>
                                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                      isActive
                                        ? "bg-brand-100 text-brand-800"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`
                                  }
                                >
                                  {subItem.icon}
                                  <span>{subItem.title}</span>
                                </NavLink>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Simple menu item (no sub-items)
                    <NavLink
                      to={item.path!}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-brand-50 text-brand-700"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-200 p-4">
            <button
              onClick={onToggle}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 lg:hidden"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t("sidebar.close")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
