export interface ApiResponse<T> {
    code: number;
    success: boolean;
    message: string;
    data: T;
}

export interface UserSettings {
  pomodoro_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  auto_start_breaks: boolean;
  auto_start_pomodoro: boolean;
  alarm_sound: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  email: string;
  settings?: UserSettings;
  created_at?: string;
  updated_at?: string;
  xp?: number;
  level?: number;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  token: string;
}

export interface Task {
  id: string;
  task: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTaskRequest {
  task: string;
}

export interface UpdateTaskRequest {
  task?: string;
  is_completed?: boolean;
}

export interface Session {
  id: string;
  user_id: string;
  task_id?: string;
  task?: Task;
  type: 'focus' | 'short_break' | 'long_break';
  status: 'completed' | 'uncompleted';
  duration: number;
  started_at: string;
  ended_at: string;
  created_at: string;
}

export interface CreateSessionRequest {
  task_id?: string;
  type: 'focus' | 'short_break' | 'long_break';
  status: 'completed' | 'uncompleted';
  duration: number;
  started_at: string;
  ended_at: string;
}

export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  token: string;
  settings?: UserSettings;
  xp?: number;
  level?: number;
}
