/**
 * Home.tsx (Worker)
 * 工人 (Worker) 角色的首页/打卡页面。
 * 核心功能是提供上下班打卡操作，显示当前时间、定位信息以及今日的打卡状态记录。
 */
import { useState, useEffect } from 'react';
import { MapPin, Clock, Camera, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkerHome() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPunching, setIsPunching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [records, setRecords] = useState<{ type: string; time: string; status: string }[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = () => {
    setIsPunching(true);
    setTimeout(() => {
      setIsPunching(false);
      setShowSuccess(true);
      setRecords(prev => [
        ...prev,
        { type: prev.length === 0 ? '上班打卡' : '下班打卡', time: currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), status: '正常' }
      ]);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 pt-12 pb-6 px-4 rounded-b-3xl shadow-md text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">智工考勤</h1>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            <span>当前项目: 绿地中心二期</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
            张
          </div>
          <div>
            <div className="font-medium text-lg">张三 (木工)</div>
            <div className="text-sm text-white/80">今天也要加油鸭！</div>
          </div>
        </div>
      </div>

      {/* Main Punch Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 mt-4">
        <div className="text-4xl font-bold text-gray-800 mb-2 font-mono tracking-tight">
          {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="flex items-center text-sm text-emerald-600 mb-8 bg-emerald-50 px-3 py-1 rounded-full">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          已进入打卡范围 (误差5米)
        </div>

        <div className="relative">
          <AnimatePresence>
            {isPunching && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center z-10"
              >
                <Camera className="w-12 h-12 text-white animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handlePunch}
            disabled={isPunching}
            className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_10px_30px_rgba(249,115,22,0.4)] flex flex-col items-center justify-center text-white active:scale-95 transition-transform disabled:opacity-80"
          >
            <span className="text-2xl font-bold mb-1">{records.length === 0 ? '上班打卡' : '下班打卡'}</span>
            <span className="text-sm opacity-90">拍照并定位</span>
          </button>
        </div>
      </div>

      {/* Today's Records */}
      <div className="px-4 mt-8">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-1 text-orange-500" />
          今日打卡记录
        </h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          {records.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-4">暂无打卡记录</div>
          ) : (
            records.map((record, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{record.type}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{record.time}</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  {record.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 z-50"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">打卡成功！辛苦了</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
