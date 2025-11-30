import {api} from "../lib/api";
import { type ApiResponse, type LoginResponse, type RegisterResponse } from '../types';

export const authService = {
    async login(email: string, password: string) {
        const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {email, password});
        return response.data;
    },

    async register(username: string, email: string, password: string) {
        const response = await api.post<ApiResponse<RegisterResponse>>('/auth/register', {username, email, password});
        return response.data;
    },

    async getProfile() {
        const response = await api.get<ApiResponse<any>>('/profile');
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/';
    }
}
