/**
 * Dashboard.tsx
 * 管理员 (Admin) 的数据仪表盘页面。
 * 提供系统整体运行状态的概览，包括在建项目数、活跃工人、预警信息等核心指标的展示。
 */
import { Users, Briefcase, AlertCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { name: '在建项目', value: '12', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: '今日在岗', value: '1,245', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: '考勤异常', value: '34', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: '本月工时', value: '28,450', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center">
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center mr-4`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">{stat.name}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4">近七日出勤趋势</h3>
          <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            图表组件占位区 (ECharts / Recharts)
          </div>
        </div>

        {/* Todo List Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">待办事项</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-3"></div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">绿地中心二期 - 考勤异常审批</div>
                    <div className="text-xs text-gray-500 mt-1">提交人: 张班长 · 10分钟前</div>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded hover:bg-gray-50 transition-colors">
                  去处理
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
