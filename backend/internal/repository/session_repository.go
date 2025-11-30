package repository

import (
	"backend/internal/entity"

	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SessionRepository struct {
	db *gorm.DB
}

func NewSessionRepository(db *gorm.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) Create(session *entity.Session) error {
	return r.db.Create(session).Error
}

func (r *SessionRepository) GetSessions(userID uuid.UUID, startDate time.Time) ([]entity.Session, error) {
	var sessions []entity.Session

	err := r.db.Preload("Task").
		Where("user_id = ? AND started_at >= ?", userID, startDate).
		Order("created_at desc").
		Find(&sessions).Error
	if err != nil {
		return nil, err
	}
	return sessions, nil
}

func (r *SessionRepository) UpdateUserXP(userID uuid.UUID, xp int) error {
	// Simple level calculation: Level = (XP / 1000) + 1
	level := (xp / 1000) + 1
	return r.db.Model(&entity.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"xp":    xp,
		"level": level,
	}).Error
}

func (r *SessionRepository) GetUserXP(userID uuid.UUID) (int, error) {
	var user entity.User
	if err := r.db.Select("xp").First(&user, userID).Error; err != nil {
		return 0, err
	}
	return user.XP, nil
}
