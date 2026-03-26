/**
 * Attendance.tsx (Worker)
 * 工人 (Worker) 角色的个人考勤记录页面。
 * 提供日历视图，让工人可以直观地查看自己每天的出勤状态（正常、迟到、缺勤等），并支持点击查看单日的详细打卡时间。
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for attendance
type AttendanceRecord = {
  status: 'normal' | 'abnormal' | 'missing';
  in: string | null;
  out: string | null;
  pic: string;
  reason?: string;
};

const mockAttendance: Record<string, AttendanceRecord> = {
  '2026-03-10': { status: 'normal', in: '07:50', out: '18:10', pic: 'https://picsum.photos/seed/1/200/200' },
  '2026-03-11': { status: 'normal', in: '07:55', out: '18:05', pic: 'https://picsum.photos/seed/2/200/200' },
  '2026-03-12': { status: 'abnormal', in: '08:15', out: '18:00', pic: 'https://picsum.photos/seed/3/200/200', reason: '迟到' },
  '2026-03-15': { status: 'missing', in: '07:50', out: null, pic: 'https://picsum.photos/seed/4/200/200', reason: '缺下班卡' },
};

export default function WorkerAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add empty days for the first week
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 relative">
        <h1 className="text-lg font-bold text-center text-gray-800 mb-4">我的考勤</h1>
        <div className="flex justify-between items-center px-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-base font-bold text-gray-800 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
            {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white px-4 pb-6 rounded-b-3xl shadow-sm mb-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['一', '二', '三', '四', '五', '六', '日'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-4 gap-x-1">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="h-10"></div>
          ))}
          {daysInMonth.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const record = mockAttendance[dateStr as keyof typeof mockAttendance];
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "relative h-10 flex flex-col items-center justify-center rounded-full transition-all",
                  isSelected ? "bg-orange-500 text-white shadow-md" : "hover:bg-orange-50",
                  isToday(day) && !isSelected && "text-orange-500 font-bold bg-orange-50/50"
                )}
              >
                <span className="text-sm">{format(day, 'd')}</span>
                {record && (
                  <div className={cn(
                    "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                    record.status === 'normal' ? "bg-emerald-400" : 
                    record.status === 'abnormal' ? "bg-amber-400" : "bg-red-400"
                  )}></div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mb-6">
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></div> 正常
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></div> 迟到/早退
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-red-400 mr-1.5"></div> 缺卡
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="absolute inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.2 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setSelectedDate(null);
                }
              }}
              className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl flex flex-col max-h-[85%]"
            >
              {/* Drag Handle */}
              <div className="w-full pt-4 pb-4 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
              </div>
              
              {/* Scrollable Content */}
              <div className="overflow-y-auto no-scrollbar px-6 pb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })} 打卡详情
                </h3>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-sm">加载打卡记录中...</p>
                </div>
              ) : mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance] ? (
                <div className="space-y-6">
                  {/* In Record */}
                  <div className="flex relative">
                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-gray-100"></div>
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center z-10 mr-4 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-800">上班打卡</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].in}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">正常</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3 mr-1" /> 绿地中心二期项目部
                      </div>
                      <img 
                        src={mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].pic} 
                        alt="打卡照片" 
                        className="w-16 h-16 rounded-lg object-cover border border-gray-100 cursor-pointer active:scale-95 transition-transform"
                        referrerPolicy="no-referrer"
                        onClick={() => setPreviewImage(mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].pic)}
                      />
                    </div>
                  </div>

                  {/* Out Record */}
                  <div className="flex relative">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center z-10 mr-4 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-800">下班打卡</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].out || '--:--'}
                          </div>
                        </div>
                        {mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].out ? (
                           <span className={cn(
                             "text-xs font-medium px-2 py-1 rounded",
                             mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].status === 'abnormal' ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"
                           )}>
                             {mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].reason || '正常'}
                           </span>
                        ) : (
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">缺卡</span>
                        )}
                      </div>
                      {mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].out && (
                        <img 
                          src={mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].pic} 
                          alt="打卡照片" 
                          className="w-16 h-16 rounded-lg object-cover border border-gray-100 cursor-pointer active:scale-95 transition-transform"
                          referrerPolicy="no-referrer"
                          onClick={() => setPreviewImage(mockAttendance[format(selectedDate, 'yyyy-MM-dd') as keyof typeof mockAttendance].pic)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-gray-400">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>当日无考勤记录</p>
                </div>
              )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="absolute inset-0 bg-black/95 z-[60] flex items-center justify-center backdrop-blur-sm"
          >
            <button 
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.8}
              onDragEnd={(e, info) => {
                if (Math.abs(info.offset.y) > 100 || Math.abs(info.velocity.y) > 500) {
                  setPreviewImage(null);
                }
              }}
              src={previewImage}
              alt="预览照片"
              className="w-full max-h-[80vh] object-contain cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
