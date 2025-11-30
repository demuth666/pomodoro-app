package service

import (
	"backend/internal/dto"
	"backend/internal/entity"
	"backend/internal/repository"
	"backend/pkg/utils"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(req dto.RegisterRequest) (*dto.AuthResponse, error) {
	existingUser, err := s.userRepo.FindByEmail(req.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	if existingUser != nil {
		return nil, errors.New("email already registered")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &entity.User{
		ID:       uuid.New(),
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return nil, err
	}

	if err = s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		Username: user.Username,
		Email:    user.Email,
		Token:    token,
	}, nil
}

func (s *AuthService) Login(req dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return nil, errors.New("invalid email or password")
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		Username:  user.Username,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
		Token:     token,
		Settings:  user.Settings,
		XP:        user.XP,
		Level:     user.Level,
	}, nil
}

func (s *AuthService) GetProfile(userID uuid.UUID) (*entity.User, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (s *AuthService) UpdateSettings(userID uuid.UUID, settings entity.UserSettings) error {
	return s.userRepo.UpdateSettings(userID, settings)
}
func (s *AuthService) UpdateProfile(userID uuid.UUID, req dto.UpdateProfileRequest) (*dto.AuthResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if email is being changed and if it's already taken
	if req.Email != user.Email {
		existingUser, err := s.userRepo.FindByEmail(req.Email)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		if existingUser != nil {
			return nil, errors.New("email already taken")
		}
	}

	user.Username = req.Username
	user.Email = req.Email

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	token, _ := utils.GenerateToken(user.ID)

	return &dto.AuthResponse{
		Username:  user.Username,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
		Token:     token,
		Settings:  user.Settings,
		XP:        user.XP,
		Level:     user.Level,
	}, nil
}
