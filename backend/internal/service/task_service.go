package service

import (
	"backend/internal/dto"
	"backend/internal/entity"
	"backend/internal/repository"
	"errors"

	"github.com/google/uuid"
)

type TaskService struct {
	taskRepo *repository.TaskRepository
}

func NewTaskService(taskRepo *repository.TaskRepository) *TaskService {
	return &TaskService{
		taskRepo: taskRepo,
	}
}

func (s *TaskService) Create(userID uuid.UUID, req dto.CreateTaskRequest) (*dto.TaskResponse, error) {
	task := &entity.Task{
		UserID:      userID,
		Task:        req.Task,
		IsCompleted: false,
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, err
	}

	return &dto.TaskResponse{
		ID:          task.ID.String(),
		UserID:      task.UserID.String(),
		Task:        task.Task,
		IsCompleted: task.IsCompleted,
	}, nil
}

func (s *TaskService) GetTasks(userID uuid.UUID) ([]dto.TaskResponse, error) {
	tasks, err := s.taskRepo.GetTasks(userID)
	if err != nil {
		return nil, err
	}

	var taskResponses []dto.TaskResponse

	for _, t := range tasks {
		response := dto.TaskResponse{
			ID:          t.ID.String(),
			UserID:      t.UserID.String(),
			Task:        t.Task,
			IsCompleted: t.IsCompleted,
			CreatedAt:   t.CreatedAt,
			UpdatedAt:   t.UpdatedAt,
		}
		taskResponses = append(taskResponses, response)
	}

	return taskResponses, nil
}

func (s *TaskService) Update(taskID uuid.UUID, userID uuid.UUID, req dto.UpdateTaskRequest) (*dto.TaskResponse, error) {
	task, err := s.taskRepo.FindByID(taskID, userID)
	if err != nil {
		return nil, errors.New("task not found")
	}

	if req.Task != "" {
		task.Task = req.Task
	}

	if req.IsCompleted != nil {
		task.IsCompleted = *req.IsCompleted
	}

	if err = s.taskRepo.Update(task); err != nil {
		return nil, err
	}

	return &dto.TaskResponse{
		ID:          task.ID.String(),
		UserID:      task.UserID.String(),
		Task:        task.Task,
		IsCompleted: task.IsCompleted,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   task.UpdatedAt,
	}, nil
}

func (s *TaskService) Delete(taskID uuid.UUID, userID uuid.UUID) error {
	_, err := s.taskRepo.FindByID(taskID, userID)
	if err != nil {
		return errors.New("task not found")
	}

	return s.taskRepo.Delete(taskID, userID)
}

func (s *TaskService) BulkDelete(taskIDs []uuid.UUID, userID uuid.UUID) error {
	return s.taskRepo.BulkDelete(taskIDs, userID)
}
