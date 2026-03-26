/**
 * ProjectAttendanceDetail.tsx
 * 老板 (Boss) 角色的项目考勤详情页面。
 * 展示特定项目在某个月份的整体考勤情况，包括出勤率、异常人数等，并提供按日历视图或列表视图查看每日考勤详情的功能。
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Users, Clock, Filter, BarChart2, List, ChevronRight, Search, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { request } from '@/lib/api';

const TIME_RANGES = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季' },
  { value: 'year', label: '本年' },
  { value: 'all', label: '全部' },
];

type ModalType = 'none' | 'presentList' | 'overtimeList' | 'personDetail';

export default function BossProjectAttendanceDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalState, setModalState] = useState<ModalType>('none');
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [detailType, setDetailType] = useState<'present' | 'overtime'>('present');
  const [personRecords, setPersonRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  const [detailSearchQuery, setDetailSearchQuery] = useState('');
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        const json = await request(`/api/v1/projects/${encodeURIComponent(name || '1')}/attendance`);
        
        // Generate daily records for the project to simulate a large dataset
        const generatedRecords = Array.from({ length: 500 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            id: i,
            date: date.toISOString().split('T')[0],
            present: Math.floor(Math.random() * 20) + 80,
            absent: Math.floor(Math.random() * 5),
            overtime: Math.floor(Math.random() * 50) + 10
          };
        });

        setProjectData({
          ...json.data,
          dailyRecords: generatedRecords
        });
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    
    setTimeout(fetchProjectData, 600);
  }, [name]);

  useEffect(() => {
    if (modalState === 'personDetail' && selectedPerson) {
      const fetchPersonRecords = async () => {
        setRecordsLoading(true);
        try {
          const json = await request(`/api/v1/workers/${selectedPerson.id}/attendance`);
          
          // Dynamically adjust dates to be relative to today
          const today = new Date();
          const dynamicData = json.data.map((record: any, index: number) => {
            const d = new Date(today);
            d.setDate(d.getDate() - index);
            return { ...record, date: d.toISOString().split('T')[0] };
          });
          
          setPersonRecords(dynamicData);
        } catch (err) {
          console.error(err);
        } finally {
          setRecordsLoading(false);
        }
      };
      setTimeout(fetchPersonRecords, 500);
    }
  }, [modalState, selectedPerson]);

  const filteredWorkers = useMemo(() => {
    const workers = projectData?.workers || [];
    if (!workerSearchQuery) return workers;
    return workers.filter((w: any) => w.name.includes(workerSearchQuery) || w.role.includes(workerSearchQuery));
  }, [workerSearchQuery, projectData]);

  const filteredPersonRecords = useMemo(() => {
    return personRecords.filter(record => {
      if (detailType === 'overtime' && record.overtimeHours === 0) return false;

      if (startDate && record.date < startDate) return false;
      if (endDate && record.date > endDate) return false;

      if (detailSearchQuery) {
        const searchStr = detailSearchQuery.toLowerCase();
        const statusMatch = record.status?.toLowerCase().includes(searchStr);
        const locationMatch = record.location?.toLowerCase().includes(searchStr);
        const dateMatch = record.date.includes(searchStr);
        if (!statusMatch && !locationMatch && !dateMatch) return false;
      }
      return true;
    });
  }, [personRecords, detailType, startDate, endDate, detailSearchQuery]);

  // Reset page when timeRange changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange]);

  // Filter data based on selected range
  const { days, records, stats } = useMemo(() => {
    let daysCount = 30;
    switch(timeRange) {
      case 'week': daysCount = 7; break;
      case 'month': daysCount = 30; break;
      case 'quarter': daysCount = 90; break;
      case 'year': daysCount = 365; break;
      case 'all': daysCount = 500; break;
    }

    const allRecords = projectData?.dailyRecords || [];
    const filteredRecords = allRecords.slice(0, daysCount);

    const calculatedStats = {
      presentTotal: filteredRecords.reduce((acc: number, r: any) => acc + r.present, 0),
      absentTotal: filteredRecords.reduce((acc: number, r: any) => acc + r.absent, 0),
      overtimeTotal: filteredRecords.reduce((acc: number, r: any) => acc + r.overtime, 0),
    };

    return { days: daysCount, records: filteredRecords, stats: calculatedStats };
  }, [timeRange, projectData]);

  // Pagination logic
  const totalPages = Math.ceil(records.length / pageSize);
  const paginatedRecords = records.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-20">
      <div className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 relative">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 active:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">{decodeURIComponent(name || '')}</h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center text-gray-600 text-sm font-medium">
          <Filter className="w-4 h-4 mr-1.5 text-blue-500" />
          条件筛选
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-1.5 outline-none font-medium"
        >
          {TIME_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <div 
          onClick={() => !loading && setModalState('presentList')}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-sm text-white cursor-pointer active:scale-95 transition-transform"
        >
          <div className="text-emerald-100 text-xs mb-1 flex items-center">
            <Users className="w-3.5 h-3.5 mr-1" />
            累计出勤人次
          </div>
          <div className="text-2xl font-bold">
            {loading ? <div className="h-8 w-16 bg-emerald-400/50 animate-pulse rounded"></div> : <>{stats.presentTotal} <span className="text-sm font-normal opacity-80">人次</span></>}
          </div>
        </div>
        <div 
          onClick={() => !loading && setModalState('overtimeList')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl shadow-sm text-white cursor-pointer active:scale-95 transition-transform"
        >
          <div className="text-orange-100 text-xs mb-1 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            累计加班时长
          </div>
          <div className="text-2xl font-bold">
            {loading ? <div className="h-8 w-16 bg-orange-400/50 animate-pulse rounded"></div> : <>{stats.overtimeTotal} <span className="text-sm font-normal opacity-80">小时</span></>}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center">
            <BarChart2 className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm font-bold text-gray-800">数据汇总</span>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-600">
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-3">统计天数</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{days} 天</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-3">累计出勤</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{stats.presentTotal} 人次</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-3">累计缺勤/请假</td>
                  <td className="px-4 py-3 text-right font-bold text-red-500">{stats.absentTotal} 人次</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">累计加班</td>
                  <td className="px-4 py-3 text-right font-bold text-orange-500">{stats.overtimeTotal} 小时</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detailed List */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <List className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm font-bold text-gray-800">详细记录</span>
            </div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-600 outline-none focus:border-blue-500"
            >
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
              <option value={50}>50条/页</option>
            </select>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm text-left text-gray-600 whitespace-nowrap">
              <thead className="text-xs text-gray-500 bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">日期</th>
                  <th className="px-4 py-3 font-medium text-right">出勤(人)</th>
                  <th className="px-4 py-3 font-medium text-right">缺勤(人)</th>
                  <th className="px-4 py-3 font-medium text-right">加班(h)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-20 animate-pulse"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-10 ml-auto animate-pulse"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-10 ml-auto animate-pulse"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-10 ml-auto animate-pulse"></div></td>
                    </tr>
                  ))
                ) : (
                  paginatedRecords.map((record, index) => (
                    <motion.tr 
                      key={record.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{record.date}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">{record.present}</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">{record.absent}</td>
                      <td className="px-4 py-3 text-right font-medium text-orange-600">{record.overtime}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                className="p-1 text-gray-500 disabled:opacity-30 active:bg-gray-200 rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs text-gray-500 font-medium">
                第 {currentPage} 页 / 共 {totalPages} 页
              </span>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="p-1 text-gray-500 disabled:opacity-30 active:bg-gray-200 rounded transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {modalState !== 'none' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-gray-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 relative flex items-center justify-between">
              <button 
                onClick={() => {
                  if (modalState === 'personDetail') {
                    setModalState(detailType === 'present' ? 'presentList' : 'overtimeList');
                  } else {
                    setModalState('none');
                  }
                }} 
                className="p-1 -ml-1 text-gray-600 active:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold text-gray-800 truncate px-2">
                {modalState === 'presentList' && '出勤人员名单'}
                {modalState === 'overtimeList' && '加班人员名单'}
                {modalState === 'personDetail' && `${selectedPerson?.name} - ${detailType === 'present' ? '出勤明细' : '加班明细'}`}
              </h1>
              <div className="w-6" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
              {(modalState === 'presentList' || modalState === 'overtimeList') && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="搜索姓名或工种..." 
                      value={workerSearchQuery}
                      onChange={(e) => setWorkerSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between animate-pulse">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                            <div>
                              <div className="h-4 w-16 bg-gray-100 rounded mb-1"></div>
                              <div className="h-3 w-20 bg-gray-100 rounded"></div>
                            </div>
                          </div>
                          <div className="h-6 w-12 bg-gray-100 rounded"></div>
                        </div>
                      ))
                    ) : filteredWorkers.map((worker: any) => (
                    <div 
                      key={worker.id}
                      onClick={() => {
                        setSelectedPerson(worker);
                        setDetailType(modalState === 'presentList' ? 'present' : 'overtime');
                        setModalState('personDetail');
                      }}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {worker.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">{worker.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{worker.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {modalState === 'presentList' ? (
                          <div className="text-emerald-600 font-bold">{worker.presentDays} <span className="text-xs font-normal text-gray-500">天</span></div>
                        ) : (
                          <div className="text-orange-600 font-bold">{worker.overtimeHours} <span className="text-xs font-normal text-gray-500">小时</span></div>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400 inline-block ml-1" />
                      </div>
                    </div>
                  ))}
                  {!loading && filteredWorkers.length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      没有找到相关人员
                    </div>
                  )}
                  </div>
                </div>
              )}

              {modalState === 'personDetail' && (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-sm text-white">
                      <div className="text-emerald-100 text-xs mb-1 flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        出勤天数
                      </div>
                      <div className="text-xl font-bold">
                        {recordsLoading ? <div className="h-6 w-12 bg-emerald-400/50 animate-pulse rounded"></div> : <>{filteredPersonRecords.filter(r => r.status === '正常出勤').length} <span className="text-xs font-normal opacity-80">天</span></>}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-sm text-white">
                      <div className="text-orange-100 text-xs mb-1 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        加班时长
                      </div>
                      <div className="text-xl font-bold">
                        {recordsLoading ? <div className="h-6 w-12 bg-orange-400/50 animate-pulse rounded"></div> : <>{filteredPersonRecords.reduce((acc, r) => acc + r.overtimeHours, 0)} <span className="text-xs font-normal opacity-80">小时</span></>}
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col space-y-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-2 py-1.5 outline-none"
                      />
                      <span className="text-gray-400 text-sm">至</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-2 py-1.5 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="搜索状态、地点或日期..." 
                        value={detailSearchQuery}
                        onChange={(e) => setDetailSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="text-xs text-gray-500 bg-gray-50/50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 font-medium">日期</th>
                          <th className="px-4 py-3 font-medium">地点</th>
                          <th className="px-4 py-3 font-medium">状态</th>
                          {detailType === 'present' ? (
                            <th className="px-4 py-3 font-medium text-right">工时(白+加)</th>
                          ) : (
                            <th className="px-4 py-3 font-medium text-right">加班时长</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {recordsLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-50 animate-pulse">
                              <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                              <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                              <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded w-12"></div></td>
                              <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-10 ml-auto"></div></td>
                            </tr>
                          ))
                        ) : filteredPersonRecords.length > 0 ? filteredPersonRecords.map((record, idx) => (
                          <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">{record.date}</td>
                            <td className="px-4 py-3 text-gray-600 truncate max-w-[80px]" title={record.location}>{record.location}</td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap",
                                record.status === '正常出勤' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                              )}>
                                {record.status}
                              </span>
                            </td>
                            {detailType === 'present' ? (
                              <td className="px-4 py-3 text-right">
                                <div className="font-medium text-gray-900">{record.dayHours + record.overtimeHours}h</div>
                                <div className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{record.dayHours}h + {record.overtimeHours}h</div>
                              </td>
                            ) : (
                              <td className="px-4 py-3 text-right font-medium text-orange-600">
                                {record.overtimeHours}h
                              </td>
                            )}
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                              没有找到符合条件的记录
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
              </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
