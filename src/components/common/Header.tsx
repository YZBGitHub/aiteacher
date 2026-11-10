import React, { useState } from 'react';
import { PageId } from '../../types';
import { AppLogo } from './AppLogo';
import { ChevronDown, LogOut } from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId, tab?: string) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  isAuthenticated,
  onLogout,
  userName = '张敏 教授',
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isPlanActive =
    currentPage === 'plan-list' ||
    currentPage === 'plan-create' ||
    currentPage === 'plan-workbench';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-6">
          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 transition-transform hover:opacity-95 shrink-0"
          >
            <AppLogo size={28} />
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              AI 教师助理
            </span>
          </button>

          {/* Vertical Divider */}
          <span className="text-slate-300 font-light select-none">|</span>

          {/* Navigation Items with active underline */}
          <nav className="flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`relative py-4 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'home'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>工作台首页</span>
              {currentPage === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onNavigate('plan-list')}
              className={`relative py-4 transition-colors whitespace-nowrap shrink-0 ${
                isPlanActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>智能教案</span>
              {isPlanActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onNavigate('ppt')}
              className={`relative py-4 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'ppt'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>AI PPT</span>
              {currentPage === 'ppt' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onNavigate('resources', 'syllabus')}
              className={`relative py-4 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'resources'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>课程资源库</span>
              {currentPage === 'resources' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onNavigate('knowledge')}
              className={`relative py-4 transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'knowledge'
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>校级知识库</span>
              {currentPage === 'knowledge' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </nav>
        </div>

        {/* Right: User Profile & New Plan Button */}
        <div className="flex items-center gap-4 shrink-0">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-800 hover:text-blue-600 p-1 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 p-0.5 shadow-xs shrink-0 flex items-center justify-center text-white font-bold text-[11px]">
                  <span>张</span>
                </div>
                <span>{userName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-fade-in">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{userName}</div>
                    <div className="text-[11px] text-slate-500">机电一体化教研室 · admin</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              立即登录
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
