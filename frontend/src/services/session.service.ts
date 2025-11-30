import {api} from "../lib/api";
import { type ApiResponse, type Session, type CreateSessionRequest } from '../types';

export const sessionService = {
    async createSession(session: CreateSessionRequest) {
        const response = await api.post<ApiResponse<Session>>('/sessions', session);
        return response.data;
    },

    async getSessions(period?: 'day' | 'week' | 'month' | 'all') {
        const response = await api.get<ApiResponse<Session[]>>('/sessions', {
            params: { period }
        });
        return response.data;
    }
}
