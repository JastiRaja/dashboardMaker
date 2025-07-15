export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface DataRow {
  [key: string]: string | number;
}

export interface Dataset {
  id: number;
  name: string;
  columns: string[];
  data: DataRow[];
  userId: number;
  createdAt: string;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'pie' | 'line' | 'table' | 'area' | 'scatter' | 'radar' | 'composed';
  title: string;
  datasetId?: number;
  xAxis?: string;
  yAxis?: string;
  settings: {
    width: number;
    height: number;
    colors?: string[];
  };
  aggregation?: string;
  groupBy?: string[];
  filters?: Array<{ column: string; operator: string; value: string }>;
}

export interface DashboardWidget {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  chartConfig: ChartConfig;
}

export interface Dashboard {
  id: number;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  userId: number;
  isPublic: boolean;
  publicId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}