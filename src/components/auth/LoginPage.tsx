import React, { useState } from 'react';
import { AppLogo } from '../common/AppLogo';
import { Lock, User, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('请输入用户名和密码');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials per requirement: admin / 123456
      if (username.trim() === 'admin' && password === '123456') {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMessage('账号或密码错误（默认账号：admin，密码：123456）');
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('123456');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-fade-in">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-2 bg-white rounded-2xl shadow-lg mb-3">
              <AppLogo size={44} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI 教师助理</h1>
            <p className="text-xs text-blue-100 mt-1 max-w-xs leading-relaxed">
              职业教育理实一体化教学与多智能体协同设计平台
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-7 space-y-5">
          {/* Default Account Hint Badge */}
          <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                默认体验：<b>admin</b> / 密码：<b>123456</b>
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline px-2 py-0.5 rounded bg-blue-100/60"
            >
              一键填入
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">用户账号</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入账号 (如: admin)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">登录密码</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码 (如: 123456)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>保持登录状态</span>
              </label>
              <button
                type="button"
                onClick={onBackToHome}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                返回工作台首页
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>正在验证登录...</span>
              ) : (
                <>
                  <span>立即登录系统</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
            <span>机电一体化技术高水平专业群 · 数字化智能教案平台</span>
          </div>
        </div>
      </div>
    </div>
  );
};
