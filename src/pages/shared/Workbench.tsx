/**
 * Workbench.tsx (Shared)
 * 共享页面：通用工作台。
 * 作为各角色的功能入口集合页。根据不同角色（如老板、工头、工人）动态渲染对应的功能模块卡片（如报销概览、施工日志、设置等）。
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Receipt, Calendar, Settings, Briefcase, Wallet, Calculator } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function MobileWorkbench() {
  const { role } = useAppStore();
  const navigate = useNavigate();
  const [processed, setProcessed] = useState<string[]>([]);

  const handleProcess = (id: string) => {
    setProcessed((prev) => [...prev, id]);
  };

  const modules = [
    { id: 'daily-report', name: '日报', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    ...(role !== 'boss' ? [{ id: 'reimbursement', name: '报销', icon: Receipt, color: 'bg-green-100 text-green-600' }] : []),
    ...(role === 'boss' ? [
      { id: 'contracts', name: '收入合同', icon: Briefcase, color: 'bg-indigo-100 text-indigo-600' },
      { id: 'income-settlement', name: '收入结算', icon: Wallet, color: 'bg-teal-100 text-teal-600' },
      { id: 'reimbursement-overview', name: '报销概览', icon: Receipt, color: 'bg-emerald-100 text-emerald-600' },
      { id: 'project-cost', name: '项目成本', icon: Calculator, color: 'bg-blue-100 text-blue-600' }
    ] : []),
    { id: 'schedule', name: '排班', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { id: 'settings', name: '设置', icon: Settings, color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 relative">
        <h1 className="text-lg font-bold text-center text-gray-800">工作台</h1>
      </div>

      {/* Modules Grid */}
      <div className="p-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-4">常用应用</h2>
          <div className="grid grid-cols-4 gap-y-6 gap-x-4">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <button 
                  key={mod.id} 
                  onClick={() => {
                    if (mod.id === 'daily-report') {
                      navigate('/daily-report');
                    } else if (mod.id === 'reimbursement') {
                      navigate('/reimbursement');
                    } else if (mod.id === 'contracts') {
                      navigate('/boss/contracts?tab=income');
                    } else if (mod.id === 'income-settlement') {
                      navigate('/boss/income-settlement');
                    } else if (mod.id === 'reimbursement-overview') {
                      navigate('/boss/reimbursement-overview');
                    } else if (mod.id === 'project-cost') {
                      navigate('/boss/project-cost');
                    }
                  }}
                  className="flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mod.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{mod.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* To-Do Section */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-4">待办事项</h2>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">提交今日施工日报</div>
                  <div className="text-xs text-gray-500 mt-0.5">今天 18:00 前</div>
                </div>
              </div>
              <button 
                onClick={() => handleProcess('report')}
                disabled={processed.includes('report')}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                  processed.includes('report') 
                    ? 'bg-gray-200 text-gray-500' 
                    : 'bg-orange-50 text-orange-600 active:bg-orange-100'
                }`}
              >
                {processed.includes('report') ? '已处理' : '去处理'}
              </button>
            </div>
            
            {role === 'foreman' && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">审批张三的报销单</div>
                    <div className="text-xs text-gray-500 mt-0.5">金额: ¥250.00</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleProcess('reimburse')}
                  disabled={processed.includes('reimburse')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                    processed.includes('reimburse') 
                      ? 'bg-gray-200 text-gray-500' 
                      : 'bg-orange-50 text-orange-600 active:bg-orange-100'
                  }`}
                >
                  {processed.includes('reimburse') ? '已审批' : '去审批'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
