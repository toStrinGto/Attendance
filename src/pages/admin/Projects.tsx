/**
 * Projects.tsx
 * 管理员 (Admin) 的项目管理页面。
 * 允许管理员查看所有项目的列表、状态、负责人和参与人数，并提供搜索和过滤功能。
 */
import { MapPin, Plus, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_PROJECTS = [
  { id: 1, name: '绿地中心二期', location: '上海市浦东新区', manager: '王建国', workers: 156, status: '在建' },
  { id: 2, name: '万科星城三期', location: '深圳市宝安区', manager: '李志强', workers: 89, status: '在建' },
  { id: 3, name: '保利国际广场', location: '广州市天河区', manager: '张明', workers: 210, status: '在建' },
  { id: 4, name: '恒大御景半岛', location: '成都市武侯区', manager: '赵铁柱', workers: 45, status: '收尾' },
];

export default function AdminProjects() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">项目管理</h2>
        <button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4 mr-2" />
          新建项目
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索项目名称..." 
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 w-64"
              />
            </div>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </button>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="h-64 bg-gray-100 border-b border-gray-200 relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="text-center z-10">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">GIS 地图组件占位区 (高德/百度地图)</p>
            <p className="text-xs text-gray-400 mt-1">展示各项目地理位置分布</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-medium">项目名称</th>
                <th className="px-6 py-4 font-medium">项目地址</th>
                <th className="px-6 py-4 font-medium">项目经理</th>
                <th className="px-6 py-4 font-medium">当前在场人数</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {MOCK_PROJECTS.map((project) => (
                <tr key={project.id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{project.name}</td>
                  <td className="px-6 py-4 text-gray-600 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    {project.location}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{project.manager}</td>
                  <td className="px-6 py-4 font-mono text-gray-800">{project.workers}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      project.status === '在建' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-orange-600 hover:text-orange-700 font-medium">查看</button>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">编辑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
