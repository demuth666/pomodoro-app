package entity

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

type UserSettings struct {
	PomodoroDuration   int    `json:"pomodoro_duration"`
	ShortBreakDuration int    `json:"short_break_duration"`
	LongBreakDuration  int    `json:"long_break_duration"`
	AutoStartBreaks    bool   `json:"auto_start_breaks"`
	AutoStartPomodoro  bool   `json:"auto_start_pomodoro"`
	AlarmSound         string `json:"alarm_sound"`
}

func (s UserSettings) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *UserSettings) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &s)
}

type User struct {
	ID        uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Username  string       `gorm:"type:varchar(100)" json:"username"`
	Email     string       `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Password  string       `gorm:"not null" json:"-"`
	Tasks     []Task       `gorm:"foreignKey:UserID" json:"tasks,omitempty"`
	Sessions  []Session    `gorm:"foreignKey:UserID" json:"sessions,omitempty"`
	Settings  UserSettings `gorm:"type:jsonb;default:'{}'" json:"settings"`
	XP        int          `gorm:"default:0" json:"xp"`
	Level     int          `gorm:"default:1" json:"level"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}
