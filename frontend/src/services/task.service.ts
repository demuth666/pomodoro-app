import {api} from "../lib/api";
import { type ApiResponse, type Task, type CreateTaskRequest, type UpdateTaskRequest } from '../types';


export const taskService = {
    async createTask(task: CreateTaskRequest) {
        const response = await api.post<ApiResponse<Task>>('/tasks', task);
        return response.data;
    },

    async getTasks() {
        const response = await api.get<ApiResponse<Task[]>>(`/tasks`);
        return response.data;
    },

    async updateTask(id: string, task: UpdateTaskRequest) {
        const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, task);
        return response.data;
    },

    async deleteTask(id: string) {
        const response = await api.delete<ApiResponse<Task>>(`/tasks/${id}`);
        return response.data;
    },

    async bulkDeleteTasks(ids: string[]) {
        const response = await api.delete<ApiResponse<Task[]>>(`/tasks/bulk-delete`, { data: { ids } });
        return response.data;
    }
}
