package dto

import (
	"time"
)

type CreateSessionRequest struct {
	TaskID    string `json:"task_id"`
	Type      string `json:"type"`
	Status    string `json:"status"`
	Duration  int    `json:"duration"`
	StartedAt string `json:"started_at"`
	EndedAt   string `json:"ended_at"`
}

type SessionResponse struct {
	ID        string        `json:"id"`
	Task      *TaskResponse `json:"task,omitempty"`
	Type      string        `json:"type"`
	Status    string        `json:"status"`
	Duration  int           `json:"duration"`
	StartedAt time.Time     `json:"started_at"`
	EndedAt   time.Time     `json:"ended_at"`
}
