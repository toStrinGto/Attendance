/**
 * api.ts
 * 统一的 API 请求封装层。
 * 支持环境区分（Mock 与真实 API），统一错误处理，以及泛型返回类型。
 */
import { ApiResponse } from '@/types/api';
import { logger } from '@/lib/logger';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const IS_MOCK = import.meta.env.VITE_MOCK_ENABLED === 'true';

export class RequestError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'RequestError';
  }
}

export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const method = (options.method || 'GET').toUpperCase();
  
  if (IS_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Log the RESTful request for debugging
    logger.debug(`[MOCK API] ${method} ${endpoint}`, options.body ? JSON.parse(options.body as string) : '');

    // For non-GET requests, simulate a successful response
    if (method !== 'GET') {
      return { code: 200, message: 'success', data: null as any };
    }

    // Map RESTful GET endpoints to local mock JSON files
    let mockUrl = '';
    if (endpoint.match(/\/api\/v1\/attendance\/summary/)) {
      mockUrl = '/mock/attendance.json';
    } else if (endpoint.match(/\/api\/v1\/projects\/[^\/]+\/attendance/)) {
      mockUrl = '/mock/project-detail.json';
    } else if (endpoint.match(/\/api\/v1\/workers\/[^\/]+\/attendance/)) {
      mockUrl = '/mock/person-records.json';
    } else if (endpoint.match(/\/api\/v1\/employees\/[^\/]+\/attendance/)) {
      mockUrl = '/mock/employee-records.json';
    } else if (endpoint.match(/\/api\/v1\/reimbursements\/pending/)) {
      mockUrl = '/mock/reimbursement-approvals.json';
    } else if (endpoint.match(/\/api\/v1\/reimbursements\/history/)) {
      mockUrl = '/mock/reimbursement-history.json';
    } else if (endpoint.match(/\/api\/v1\/reports\/templates/)) {
      mockUrl = '/mock/daily-report-templates.json';
    } else if (endpoint.match(/\/api\/v1\/reports\/history/)) {
      mockUrl = '/mock/daily-report-history.json';
    } else if (endpoint.match(/\/api\/v1\/dashboard\/boss/)) {
      mockUrl = '/mock/boss-home.json';
    } else if (endpoint.match(/\/api\/v1\/contracts/)) {
      mockUrl = '/mock/contracts.json';
    } else if (endpoint.match(/\/api\/v1\/income-settlements/)) {
      mockUrl = '/mock/income-settlements.json';
    } else if (endpoint.match(/\/api\/v1\/projects/)) {
      mockUrl = '/mock/projects.json';
    } else if (endpoint.match(/\/api\/v1\/reimbursement\/overview/)) {
      mockUrl = '/mock/reimbursement-overview.json';
    } else if (endpoint.match(/\/api\/v1\/reimbursement\/project-detail/)) {
      mockUrl = '/mock/project-reimbursement-detail.json';
    } else if (endpoint.match(/\/api\/v1\/foreman\/projects/)) {
      mockUrl = '/mock/foreman-projects.json';
    } else if (endpoint.match(/\/api\/v1\/foreman\/workers/)) {
      mockUrl = '/mock/foreman-workers.json';
    } else if (endpoint.match(/\/api\/v1\/foreman\/site-status/)) {
      mockUrl = '/mock/foreman-site-status.json';
    } else if (endpoint.match(/\/api\/v1\/foreman\/exceptions/)) {
      mockUrl = '/mock/foreman-exceptions.json';
    }

    if (mockUrl) {
      const res = await fetch(mockUrl);
      if (!res.ok) throw new RequestError(res.status, `Mock 请求失败: ${res.status}`);
      return await res.json();
    }

    throw new RequestError(404, `未找到Mock路由: ${endpoint}`);
  }

  // Real API Request
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.replace('/api/v1', '')}`;
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        logger.warn('Unauthorized, redirect to login');
        // Handle unauthorized logic here
      }
      throw new RequestError(response.status, `HTTP Error: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    
    if (data.code !== 200) {
      logger.error(`Business Error: ${data.message}`);
      // Trigger global error toast here if needed
      throw new RequestError(data.code, data.message);
    }

    return data;
  } catch (error) {
    logger.error('[Request Error]', error);
    throw error;
  }
}
