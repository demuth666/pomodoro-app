package repository

import (
	"backend/internal/entity"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *entity.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByEmail(email string) (*entity.User, error) {
	var user entity.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(userID uuid.UUID) (*entity.User, error) {
	var user entity.User
	err := r.db.Where("id = ?", userID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) UpdateSettings(userID uuid.UUID, settings entity.UserSettings) error {
	return r.db.Model(&entity.User{}).Where("id = ?", userID).Update("settings", settings).Error
}

func (r *UserRepository) Update(user *entity.User) error {
	return r.db.Save(user).Error
}
