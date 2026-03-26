import { request } from '@/lib/api';
import { Project, Worker, SiteStatus, Exception, AttendanceSubmitPayload } from '@/types/models';

export const foremanApi = {
  getProjects: () => request<Project[]>('/api/v1/foreman/projects'),
  getWorkers: () => request<Worker[]>('/api/v1/foreman/workers'),
  submitAttendance: (data: AttendanceSubmitPayload) => request<void>('/api/v1/foreman/attendance', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getSiteStatus: () => request<SiteStatus>('/api/v1/foreman/site-status'),
  getExceptions: () => request<Exception[]>('/api/v1/foreman/exceptions'),
  processException: (id: number) => request<void>(`/api/v1/foreman/exceptions/${id}/process`, {
    method: 'POST'
  })
};
