/**
 * WebAdminLayout.tsx
 * Web端（PC端）后台管理系统的布局组件。
 * 负责渲染侧边栏导航和顶部状态栏，主要用于管理员 (admin) 角色的页面布局。
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Map, Settings, LogOut, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function WebAdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { name: '工作台', path: '/admin', icon: LayoutDashboard },
    { name: '项目管理', path: '/admin/projects', icon: Map },
    { name: '员工管理', path: '/admin/employees', icon: Users },
    { name: '系统设置', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-tight">智工考勤后台</span>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-orange-500/10 text-orange-500 font-medium"
                        : "hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center w-full px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4 mr-3" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-medium text-gray-800">
            {navItems.find(i => i.path === location.pathname)?.name || '管理后台'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
              管
            </div>
            <span className="text-sm font-medium text-gray-700">超级管理员</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
