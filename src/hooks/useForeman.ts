import { useState, useEffect, useCallback } from 'react';
import { foremanApi } from '@/services/foreman';
import { Project, Worker, SiteStatus, Exception, AttendanceSubmitPayload } from '@/types/models';

export function useForemanWorkbench() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [projectsRes, workersRes] = await Promise.all([
        foremanApi.getProjects(),
        foremanApi.getWorkers()
      ]);
      setProjects(projectsRes.data);
      setWorkers(workersRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submitAttendance = async (payload: AttendanceSubmitPayload) => {
    await foremanApi.submitAttendance(payload);
  };

  return { projects, workers, loading, error, submitAttendance, refetch: fetchData };
}

export function useForemanSite() {
  const [status, setStatus] = useState<SiteStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await foremanApi.getSiteStatus();
      setStatus(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch site status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
}

export function useForemanExceptions() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExceptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await foremanApi.getExceptions();
      setExceptions(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exceptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  const processException = async (id: number) => {
    await foremanApi.processException(id);
    setExceptions(prev => prev.map(e => e.id === id ? { ...e, status: 'handled' } : e));
  };

  return { exceptions, loading, error, processException, refetch: fetchExceptions };
}
