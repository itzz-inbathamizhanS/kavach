import { useState } from 'react';
import { MemoryRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export function Header({ onLogout }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Advisories", path: "/advisories" },
    { label: "Indicators", path: "/indicators" },
    { label: "Enforcement", path: "/enforcement" },
    { label: "Approvals", path: "/approvals" },
    { label: "Ledger", path: "/ledger" },
    { label: "Settings", path: "/settings" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-page-bg border-b border-border-hairline transition-colors">
      <div className="max-w-[1200px] mx-auto px-margin h-14 flex items-center justify-between">
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="flex items-center gap-space-xs text-on-surface hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-[20px] text-on-surface">shield</span>
            <span className="font-headline-h2 text-headline-h2 font-medium tracking-tight">KAVACH</span>
          </Link>
          <nav className="hidden md:flex items-center gap-space-lg h-14">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`h-full flex items-center border-b-2 text-body-sm transition-colors ${
                    isActive
                      ? "border-on-surface text-on-surface font-medium"
                      : "border-transparent text-secondary hover:text-on-surface"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-panel transition-colors"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button 
            onClick={onLogout}
            title="Sign out / Switch account"
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-sm text-[12px] font-medium hover:opacity-85 transition-opacity"
          >
            <span>AD</span>
          </button>
        </div>
      </div>
    </header>
  );
}
