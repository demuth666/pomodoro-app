import { api } from '../lib/api';
import type { ApiResponse, UserSettings } from '../types';

export const settingsService = {
  async update(settings: UserSettings) {
    const response = await api.put<ApiResponse<UserSettings>>('/settings', settings);
    return response.data;
  }
};
