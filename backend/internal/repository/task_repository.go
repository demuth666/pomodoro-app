package repository

import (
	"backend/internal/entity"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TaskRepository struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) GetTasks(userID uuid.UUID) ([]entity.Task, error) {
	var tasks []entity.Task
	err := r.db.Where("user_id = ?", userID).Find(&tasks).Error
	if err != nil {
		return nil, err
	}
	return tasks, nil
}

func (r *TaskRepository) FindByID(id uuid.UUID, userID uuid.UUID) (*entity.Task, error) {
	var task entity.Task
	err := r.db.Where("id = ? and user_id = ?", id, userID).First(&task).Error
	if err != nil {
		return nil, err
	}

	return &task, nil
}

func (r *TaskRepository) Create(task *entity.Task) error {
	return r.db.Create(task).Error
}

func (r *TaskRepository) Update(task *entity.Task) error {
	return r.db.Save(task).Error
}

func (r *TaskRepository) Delete(id uuid.UUID, userID uuid.UUID) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&entity.Task{}).Error
}

func (r *TaskRepository) BulkDelete(ids []uuid.UUID, userID uuid.UUID) error {
	return r.db.Where("id IN ? AND user_id = ?", ids, userID).Delete(&entity.Task{}).Error
}
