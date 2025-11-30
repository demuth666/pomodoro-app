package dto

import (
	"time"

	"github.com/google/uuid"
)

type CreateTaskRequest struct {
	Task string `json:"task" validate:"required,min=1,max=100"`
}

type UpdateTaskRequest struct {
	Task        string `json:"task" validate:"omitempty,min=1,max=100"`
	IsCompleted *bool  `json:"is_completed" validate:"omitempty"`
}

type TaskResponse struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Task        string    `json:"task"`
	IsCompleted bool      `json:"is_completed"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type BulkDeleteRequest struct {
	IDs []uuid.UUID `json:"ids" validate:"required,min=1"`
}
