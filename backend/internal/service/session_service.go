package service

import (
	"backend/internal/dto"
	"backend/internal/entity"
	"backend/internal/repository"
	"errors"
	"time"

	"github.com/google/uuid"
)

type SessionService struct {
	sessionRepo *repository.SessionRepository
}

func NewSessionService(sessionRepo *repository.SessionRepository) *SessionService {
	return &SessionService{
		sessionRepo: sessionRepo,
	}
}

func (s *SessionService) CreateSession(userID uuid.UUID, req dto.CreateSessionRequest) (*entity.Session, error) {
	startedAt, err := time.Parse(time.RFC3339, req.StartedAt)
	if err != nil {
		return nil, errors.New("invalid started_at format")
	}
	endedAt, err := time.Parse(time.RFC3339, req.EndedAt)
	if err != nil {
		return nil, errors.New("invalid ended_at format")
	}

	var taskIDPtr *uuid.UUID
	if req.TaskID != "" {
		parsedID, err := uuid.Parse(req.TaskID)
		if err == nil {
			taskIDPtr = &parsedID
		}
	}

	session := entity.Session{
		ID:        uuid.New(),
		UserID:    userID,
		TaskID:    taskIDPtr,
		Type:      entity.SessionType(req.Type),
		Status:    entity.SessionStatus(req.Status),
		Duration:  req.Duration,
		StartedAt: startedAt,
		EndedAt:   endedAt,
	}

	if err := s.sessionRepo.Create(&session); err != nil {
		return nil, err
	}

	// Gamification Logic
	if session.Status == entity.SessionStatusCompleted && session.Type == entity.SessionTypeFocus {
		// 10 XP per minute
		xpGained := (session.Duration / 60) * 10
		if xpGained > 0 {
			currentXP, err := s.sessionRepo.GetUserXP(userID)
			if err == nil {
				newXP := currentXP + xpGained
				_ = s.sessionRepo.UpdateUserXP(userID, newXP)
			}
		}
	}

	return &session, nil
}

func (s *SessionService) GetSessions(userID uuid.UUID, startDate time.Time) ([]dto.SessionResponse, error) {
	tasks, err := s.sessionRepo.GetSessions(userID, startDate)
	if err != nil {
		return nil, err
	}

	var sessionResponses []dto.SessionResponse

	for _, t := range tasks {
		response := dto.SessionResponse{
			ID:        t.ID.String(),
			Type:      string(t.Type),
			Status:    string(t.Status),
			Duration:  t.Duration,
			StartedAt: t.StartedAt,
			EndedAt:   t.EndedAt,
		}

		if t.Task != nil {
			response.Task = &dto.TaskResponse{
				ID:          t.Task.ID.String(),
				UserID:      t.Task.UserID.String(),
				Task:        t.Task.Task,
				IsCompleted: t.Task.IsCompleted,
				CreatedAt:   t.Task.CreatedAt,
				UpdatedAt:   t.Task.UpdatedAt,
			}
		}
		sessionResponses = append(sessionResponses, response)
	}

	return sessionResponses, nil
}
