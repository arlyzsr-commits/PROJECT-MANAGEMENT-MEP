export type UserRole = 'MANAGER' | 'SUPERVISOR' | 'VIEWER';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  company?: string;
  createdAt?: string;
}

export type Language = 'en' | 'id';

export interface Project {
  id: string;
  name: string;
  company: string;
  location: string;
  projectType: string;
  department: string;
  createdAt: string;
}

export interface Building {
  id: string;
  projectId: string;
  name: string;
  buildingType: string;
  zone: string;
  floorCount: number;
  rooms?: string[];
  description: string;
  pic: string;
  targetStartDate: string;
  targetFinishDate: string;
  status: 'Active' | 'Completed' | 'Pending' | 'Delayed';
  createdAt?: string;
}

export type MEPCategory = 'ELECTRICAL' | 'MECHANICAL' | 'PLUMBING' | 'ICT & ELV';

export interface WorkItem {
  id: string;
  projectId: string;
  buildingId: string;
  buildingName: string;
  area: string;
  room: string;
  category: MEPCategory;
  subcategory: string;
  description: string;
  unit: string;
  boqQuantity: number;
  workWeight: number; // percentage weight, e.g. 5.5%
  completedQuantity: number;
  progressPercentage: number;
  plannedStart: string;
  plannedFinish: string;
  contractor: string;
  pic: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  createdAt?: string;
}

export type WeatherType = 'Sunny' | 'Cloudy' | 'Rainy' | 'Heavy Rain';
export type ProgressStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface DailyProgress {
  id: string;
  reportId: string;
  projectId: string;
  workItemId: string;
  date: string;
  buildingId: string;
  buildingName: string;
  area: string;
  room: string;
  category: MEPCategory;
  subcategory: string;
  contractor: string;
  pic: string;
  plannedQuantity: number;
  previousCumulativeQuantity: number;
  dailyCompletedQuantity: number;
  currentCumulativeQuantity: number;
  progressPercentage: number;
  manpower: number;
  equipment: string;
  weather: WeatherType;
  workDescription: string;
  issues: string;
  nextAction: string;
  targetDate: string;
  status: ProgressStatus;
  submittedBy?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface PhotoDocument {
  id: string;
  projectId: string;
  buildingId: string;
  buildingName: string;
  room: string;
  workItemId?: string;
  category: MEPCategory | string;
  photoUrl: string;
  date: string;
  photographer: string;
  workDescription: string;
  progress?: number;
  remarks?: string;
  pic: string;
  contractor: string;
  gpsCoordinates?: string;
  watermarkEnabled?: boolean;
  fileType?: string;
  fileName?: string;
  createdAt: string;
}

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus = 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';

export interface Issue {
  id: string;
  projectId: string;
  buildingId: string;
  buildingName: string;
  room: string;
  workItemId?: string;
  workDescription?: string;
  description: string;
  priority: IssuePriority;
  responsiblePic: string;
  contractor: string;
  targetCompletion: string;
  actualCompletion?: string;
  status: IssueStatus;
  remarks: string;
  supportingPhotos?: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  projectId: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';
  collection: string;
  documentId: string;
  beforeData?: string;
  afterData?: string;
  details: string;
}

export interface GlobalFilter {
  dateRangeStart?: string;
  dateRangeEnd?: string;
  buildingId?: string;
  area?: string;
  room?: string;
  category?: string;
  contractor?: string;
  pic?: string;
  status?: string;
  searchQuery?: string;
}
