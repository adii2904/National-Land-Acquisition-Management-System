export type UserRole = 'admin' | 'viewer' | 'analyst';
export type AccessLevel = 'Central' | 'State' | 'District' | 'Project';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarColor: string;
  accessLevel: AccessLevel;
  status: 'Active' | 'Inactive';
  lastActive: string;
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'flat';
  icon: string;
  accent: string;
}

export interface Project {
  id: string;
  name: string;
  ministry: string;
  state: string;
  status: 'Completed' | 'In Progress' | 'Delayed' | 'Not Started';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  contractor: string;
  phase: ProjectPhase;
}

export type ProjectPhase = 'Notified' | 'Acquired' | 'Compensation' | 'Possession' | 'R&R Done';

export interface StateInfo {
  code: string;
  name: string;
  projects: number;
  investment: number;
  utilization: number;
  cx: number;
  cy: number;
  r: number;
  color: string;
}

export type ChartDatum = { label: string; value: number; value2?: number };

export interface RRStateData {
  state: string;
  affected: number;
  resettled: number;
  compensation: number;
  status: 'Completed' | 'In Progress' | 'Delayed';
  completion: number;
}

export interface DocItem {
  id: string;
  name: string;
  type: 'Proposal' | 'EIA' | 'SIA' | 'Map' | 'Compensation' | 'R&R';
  project: string;
  date: string;
  size: string;
}

export type NotificationType = 'approval' | 'submission' | 'financial' | 'alert';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  avatarColor: string;
}

export interface SavedReport {
  id: string;
  name: string;
  type: string;
  date: string;
  format: string;
}

export interface TimelineProject {
  id: string;
  name: string;
  start: number;
  duration: number;
  color: string;
  phase: string;
}
