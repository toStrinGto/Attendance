import React, { useState, useEffect } from 'react';
import { Search, Edit2, Save, X, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Worker } from '@/types/models';
import { foremanApi } from '@/services/foreman';

export default function AdminEmployees() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWage, setEditWage] = useState<string>('');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await foremanApi.getWorkers();
        const workersWithWage = res.data.map(w => ({
          ...w,
          dailyWage: w.dailyWage ?? 0
        }));
        setWorkers(workersWithWage);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const handleEdit = (worker: Worker) => {
    setEditingId(worker.id);
    setEditWage(worker.dailyWage?.toString() || '0');
  };

  const handleSave = (id: number) => {
    const wage = parseFloat(editWage);
    if (isNaN(wage) || wage < 0) {
      alert('请输入有效的日薪金额');
      return;
    }
    
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, dailyWage: wage } : w));
    setEditingId(null);
  };

  const filteredWorkers = workers.filter(w => w.name.includes(searchQuery) || w.role.includes(searchQuery));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            员工管理
          </h2>
          <p className="text-gray-500 text-sm mt-1">管理员工信息与日薪配置</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名或角色..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Worker List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">员工信息</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">角色/工种</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">日薪 (¥)</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                          {worker.avatar || worker.name[0]}
                        </div>
                        <div className="font-medium text-gray-900">{worker.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {worker.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === worker.id ? (
                        <div className="flex items-center justify-end">
                          <input 
                            type="number" 
                            value={editWage}
                            onChange={(e) => setEditWage(e.target.value)}
                            className="w-24 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">
                          {worker.dailyWage?.toFixed(2) || '0.00'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === worker.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleSave(worker.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(worker)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      没有找到匹配的员工
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
