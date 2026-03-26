/**
 * Home.tsx
 * 老板 (Boss) 角色的首页/仪表盘。
 * 提供公司整体运营数据的宏观视图，包括总收入、总支出、活跃项目数等，并展示待办事项和最新动态。
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, FileText, CheckCircle, AlertCircle, Receipt, Banknote, Building2, ChevronRight, Calculator, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { request } from '@/lib/api';

interface DashboardData {
  briefing: {
    incomeContract: string;
    incomeSettlement: string;
    collectionAmount: string;
    invoiceAmount: string;
  };
  projects: {
    activeCount: number;
    invoicedUncollected: string;
    paidUninvoiced: string;
    pendingRepayment: string;
  };
  reimbursements: Array<{
    name: string;
    amount: string;
    count: number;
    percent: number;
  }>;
}

export default function BossHome() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const json = await request('/api/v1/dashboard/boss');
        if (json.code === 200) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 pt-12 pb-10 px-4 rounded-b-3xl shadow-lg text-white">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">企业看板</h1>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <span className="font-bold">老</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm">欢迎回来，随时掌握企业动态</p>
      </div>

      <div className="px-4 -mt-6 space-y-4 relative z-10">
        {/* 数据简报 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
            数据简报 (本年度)
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 h-16 animate-pulse" />
              ))}
            </div>
          ) : data ? (
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => navigate('/boss/contracts?tab=income')}
                className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50 active:scale-95 transition-transform cursor-pointer"
              >
                <div className="text-xs text-gray-500 mb-1">收入合同</div>
                <div className="text-lg font-bold text-gray-800">¥ {data.briefing.incomeContract}</div>
              </div>
              <div 
                onClick={() => navigate('/boss/income-settlement')}
                className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50 active:scale-95 transition-transform cursor-pointer"
              >
                <div className="text-xs text-gray-500 mb-1">收入结算</div>
                <div className="text-lg font-bold text-gray-800">¥ {data.briefing.incomeSettlement}</div>
              </div>
              <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                <div className="text-xs text-gray-500 mb-1">收款金额</div>
                <div className="text-lg font-bold text-gray-800">¥ {data.briefing.collectionAmount}</div>
              </div>
              <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/50">
                <div className="text-xs text-gray-500 mb-1">开票金额</div>
                <div className="text-lg font-bold text-gray-800">¥ {data.briefing.invoiceAmount}</div>
              </div>
              <div 
                onClick={() => navigate('/boss/project-cost')}
                className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50 active:scale-95 transition-transform cursor-pointer col-span-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center">
                      <Calculator className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                      项目成本
                    </div>
                    <div className="text-lg font-bold text-gray-800">查看详情</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 项目情况 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center">
            <Building2 className="w-5 h-5 text-indigo-500 mr-2" />
            项目情况
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : data ? (
            <div className="space-y-3">
              <div 
                onClick={() => navigate('/boss/projects?status=施工中')}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">进行中的项目</span>
                </div>
                <span className="text-base font-bold text-gray-900">{data.projects.activeCount} 个</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">合同已开票未收款</span>
                </div>
                <span className="text-base font-bold text-amber-600">¥ {data.projects.invoicedUncollected}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mr-3">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">合同已付款未收票</span>
                </div>
                <span className="text-base font-bold text-rose-600">¥ {data.projects.paidUninvoiced}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">待还款</span>
                </div>
                <span className="text-base font-bold text-red-600">¥ {data.projects.pendingRepayment}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* 各项目报销情况 */}
        <div 
          onClick={() => navigate('/boss/reimbursement-overview')}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center">
              <Banknote className="w-5 h-5 text-emerald-500 mr-2" />
              各项目报销情况 (本月)
            </h2>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-200 rounded-full w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : data ? (
            <div className="space-y-4">
              {data.reimbursements.map((project, idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-sm font-medium text-gray-800">{project.name}</div>
                    <div className="text-sm font-bold text-gray-900">¥ {project.amount}</div>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{project.count} 笔待审核/已报销</div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${project.percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full" 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
