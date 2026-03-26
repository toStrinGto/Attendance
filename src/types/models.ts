export interface Worker {
  id: number;
  name: string;
  role: string;
  avatar: string;
  dailyWage?: number;
}

export interface Project {
  id: number;
  name: string;
  team: string;
  count: number;
}

export interface Photo {
  id: number;
  name: string;
  time: string;
  pic: string;
}

export interface SiteStatus {
  projectName: string;
  totalWorkers: number;
  checkedIn: number;
  missing: number;
  photos: Photo[];
}

export interface Exception {
  id: number;
  name: string;
  date: string;
  reason: string;
  status: 'pending' | 'handled';
}

export interface AttendanceRecord {
  workerId: number;
  dayShift: number;
  overtimeHours: number;
}

export interface AttendanceSubmitPayload {
  projectId: number;
  records: AttendanceRecord[];
}

