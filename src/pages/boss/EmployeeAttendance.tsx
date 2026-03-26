/**
 * EmployeeAttendance.tsx
 * 老板 (Boss) 角色的员工考勤列表页面。
 * 展示特定项目下所有员工的考勤状态（正常、迟到、缺勤等），支持按员工姓名搜索。
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, UserCheck, UserX, Clock, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MOCK_EMPLOYEES = [
  { id: 1, name: '张三', team: '木工班组', project: '绿地中心二期项目部', status: 'present', time: '07:50', overtime: 2 },
  { id: 2, name: '李四', team: '水电班组', project: '万达广场三期', status: 'present', time: '07:55', overtime: 0 },
  { id: 3, name: '王五', team: '泥瓦班组', project: '高新区科技园', status: 'absent', reason: '请假' },
  { id: 4, name: '赵六', team: '钢筋班组', project: '地铁6号线标段', status: 'present', time: '07:45', overtime: 1.5 },
  { id: 5, name: '陈七', team: '木工班组', project: '绿地中心二期项目部', status: 'present', time: null, overtime: 0 },
  { id: 6, name: '周八', team: '钢筋班组', project: '万达广场三期', status: 'absent', reason: '未打卡' },
  { id: 7, name: '吴九', team: '泥瓦班组', project: '高新区科技园', status: 'present', time: null, overtime: 3 },
  { id: 8, name: '郑十', team: '水电班组', project: '地铁6号线标段', status: 'present', time: '07:52', overtime: 1 },
];

export default function BossEmployeeAttendance() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');

  const filteredEmployees = MOCK_EMPLOYEES.filter(e => {
    const matchesSearch = e.name.includes(searchQuery) || e.team.includes(searchQuery) || e.project.includes(searchQuery);
    const matchesFilter = filter === 'all' || e.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 relative">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 active:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">人员考勤明细</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名、班组或项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors", filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600')}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('present')}
            className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors", filter === 'present' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600')}
          >
            出勤
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors", filter === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600')}
          >
            缺勤
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {filteredEmployees.map((emp, index) => (
          <motion.div
            key={emp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/employee-detail/${emp.id}`)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                  emp.status === 'present' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                )}>
                  {emp.name[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800 flex items-center">
                    {emp.name}
                    <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {emp.team}
                    </span>
                  </div>
                  <div 
                    className="text-xs text-blue-500 mt-1 flex items-center cursor-pointer active:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/project-attendance/${encodeURIComponent(emp.project)}`);
                    }}
                  >
                    <CalendarDays className="w-3 h-3 mr-1" />
                    {emp.project}
                  </div>
                </div>
              </div>
              <div>
                {emp.status === 'present' ? (
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center">
                      <UserCheck className="w-3 h-3 mr-1" />
                      {emp.time ? `${emp.time} 打卡` : '已打卡'}
                    </span>
                    {emp.overtime > 0 && (
                      <span className="text-[10px] font-medium text-orange-600 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-0.5" />
                        加班 {emp.overtime}h
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 flex items-center">
                    <UserX className="w-3 h-3 mr-1" />
                    {emp.reason}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            <p>未找到相关人员记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
