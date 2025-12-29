import React from 'react';
import { useTranslation } from 'react-i18next';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  const { t } = useTranslation();

  return (
    <div className={`border-b border-slate-200 ${className}`}>
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                group inline-flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon && (
                <span className={`mr-2 ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isActive
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span
                  className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isActive
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
