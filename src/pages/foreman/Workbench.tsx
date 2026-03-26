/**
 * Workbench.tsx (Foreman)
 * 工头 (Foreman) 角色的工作台页面。
 * 核心功能是进行班前点名，支持批量确认工人出勤状态，并可调整工人的出勤工时（如半天、全天）。
 */
import { useState } from 'react';
import { CheckCircle2, Minus, Plus, Users, Briefcase, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForemanWorkbench } from '@/hooks/useForeman';
import { WorkerListItem } from './components/WorkerListItem';
import { ProjectSelectorModal } from './components/ProjectSelectorModal';
import { Project } from '@/types/models';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/OldButton';
import { List } from '@/components/ui/List';
import { logger } from '@/lib/logger';

export default function ForemanWorkbench() {
  const { projects, workers, loading, submitAttendance } = useForemanWorkbench();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [dayShift, setDayShift] = useState(1);
  const [globalOvertime, setGlobalOvertime] = useState(0);
  const [overtimeMap, setOvertimeMap] = useState<Record<number, number>>({});
  const [submittedRecords, setSubmittedRecords] = useState<Record<number, { dayShift: number, overtime: number }>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial project when loaded
  if (!selectedProject && projects.length > 0) {
    setSelectedProject(projects[0]);
  }

  const toggleWorker = (id: number) => {
    setSelectedWorkers(prev => {
      if (prev.includes(id)) {
        return prev.filter(wId => wId !== id);
      } else {
        return [...prev, id];
      }
    });
    
    if (!selectedWorkers.includes(id)) {
      setOvertimeMap(prev => ({ ...prev, [id]: globalOvertime }));
    }
  };

  const handleOvertimeChange = (id: number, overtime: number) => {
    setOvertimeMap(prev => ({ ...prev, [id]: overtime }));
  };

  const handleGlobalOvertimeChange = (newOvertime: number) => {
    setGlobalOvertime(newOvertime);
    setOvertimeMap(prev => {
      const newMap = { ...prev };
      selectedWorkers.forEach(id => {
        newMap[id] = newOvertime;
      });
      return newMap;
    });
  };

  const selectAll = () => {
    if (selectedWorkers.length === workers.length) {
      setSelectedWorkers([]);
    } else {
      const allIds = workers.map(w => w.id);
      setSelectedWorkers(allIds);
      
      setOvertimeMap(prev => {
        const newMap = { ...prev };
        allIds.forEach(id => {
          if (!selectedWorkers.includes(id)) {
             newMap[id] = globalOvertime;
          }
        });
        return newMap;
      });
    }
  };

  const handleSubmit = async () => {
    if (selectedWorkers.length === 0 || !selectedProject) return;
    
    try {
      setIsSubmitting(true);
      const records = selectedWorkers.map(workerId => ({
        workerId,
        dayShift,
        overtimeHours: overtimeMap[workerId] || 0
      }));

      await submitAttendance({
        projectId: selectedProject.id,
        records
      });
      
      setSubmittedRecords(prev => {
        const newRecords = { ...prev };
        selectedWorkers.forEach(id => {
          newRecords[id] = { dayShift, overtime: overtimeMap[id] || 0 };
        });
        return newRecords;
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedWorkers([]);
        setDayShift(1);
        setGlobalOvertime(0);
        setOvertimeMap({});
      }, 2000);
    } catch (error) {
      logger.error('Failed to submit attendance', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-full bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 relative md:pt-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-bold text-center text-gray-800 mb-4 md:text-2xl md:text-left">批量记工</h1>
          
          {/* Project Selector */}
          <Card 
            onClick={() => setShowProjectModal(true)}
            className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-orange-500 mr-2" />
                <div>
                  <div className="text-sm font-bold text-gray-800 md:text-base">{selectedProject.name}</div>
                  <div className="text-xs text-gray-500 md:text-sm">{selectedProject.team} (共{selectedProject.count}人)</div>
                </div>
              </div>
              <div className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-md">
                切换
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col md:flex-row md:gap-6 md:p-6 md:overflow-hidden">
        {/* Worker List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 md:px-0 md:py-0 md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center md:text-base">
              <Users className="w-4 h-4 mr-1.5 text-orange-500 md:w-5 md:h-5" />
              选择工人 ({selectedWorkers.length}/{workers.length})
            </h3>
            <button onClick={selectAll} className="text-xs text-orange-500 font-medium hover:text-orange-600 md:text-sm">
              {selectedWorkers.length === workers.length ? '取消全选' : '全选'}
            </button>
          </div>

          <List>
            {workers.map(worker => (
              <WorkerListItem 
                key={worker.id}
                worker={worker}
                isSelected={selectedWorkers.includes(worker.id)}
                overtime={overtimeMap[worker.id] || 0}
                submittedRecord={submittedRecords[worker.id]}
                onToggle={toggleWorker}
                onOvertimeChange={handleOvertimeChange}
              />
            ))}
          </List>
        </div>

        {/* Input Panel */}
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-6 z-20 md:w-80 md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:h-fit">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm font-bold text-gray-800">白班 (个)</div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setDayShift(Math.max(0, dayShift - 0.5))}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold w-8 text-center">{dayShift}</span>
              <button 
                onClick={() => setDayShift(dayShift + 0.5)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm font-bold text-gray-800">加班 (小时)</div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleGlobalOvertimeChange(Math.max(0, globalOvertime - 0.5))}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold w-8 text-center">{globalOvertime}</span>
              <button 
                onClick={() => handleGlobalOvertimeChange(Math.min(24, globalOvertime + 0.5))}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedWorkers.length === 0}
            isLoading={isSubmitting}
            className="w-full"
            size="lg"
          >
            确认记工 ({selectedWorkers.length}人)
          </Button>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 z-50 md:bottom-10"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">记工成功！</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Switch Modal */}
      <ProjectSelectorModal 
        isOpen={showProjectModal}
        projects={projects}
        selectedProject={selectedProject}
        onClose={() => setShowProjectModal(false)}
        onSelect={(project) => {
          setSelectedProject(project);
          setShowProjectModal(false);
        }}
      />
    </div>
  );
}
