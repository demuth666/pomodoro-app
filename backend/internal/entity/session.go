package entity

import (
	"time"

	"github.com/google/uuid"
)

type SessionType string
type SessionStatus string

const (
	SessionTypeFocus      SessionType = "focus"
	SessionTypeShortBreak SessionType = "short_break"
	SessionTypeLongBreak  SessionType = "long_break"

	SessionStatusCompleted SessionStatus = "completed"
	SessionStatusStopped   SessionStatus = "uncompleted"
)

type Session struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`

	UserID uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	User   User       `gorm:"foreignKey:UserID" json:"-"`
	TaskID *uuid.UUID `gorm:"type:uuid" json:"task_id"`
	Task   *Task      `gorm:"foreignKey:TaskID" json:"task,omitempty"`

	Type   SessionType   `gorm:"type:varchar(20);not null" json:"type"`
	Status SessionStatus `gorm:"type:varchar(20);not null" json:"status"`

	Duration int `gorm:"not null" json:"duration"`

	StartedAt time.Time `gorm:"not null" json:"started_at"`
	EndedAt   time.Time `gorm:"not null" json:"ended_at"`

	CreatedAt time.Time `json:"created_at"`
}
