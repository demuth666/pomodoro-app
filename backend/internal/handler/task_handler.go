package handler

import (
	"backend/internal/dto"
	"backend/internal/service"
	"backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type TaskHandler struct {
	taskService *service.TaskService
}

func NewTaskHandler(taskService *service.TaskService) *TaskHandler {
	return &TaskHandler{
		taskService: taskService,
	}
}

func (h *TaskHandler) Create(c *fiber.Ctx) error {
	userID := c.Locals("id").(uuid.UUID)

	var req dto.CreateTaskRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(req); err != nil {
		validationErrors := utils.FormatValidationError(err)
		return utils.ValidationErrorResponse(c, validationErrors)
	}

	task, err := h.taskService.Create(userID, req)
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to create task")
	}

	return utils.CreatedResponse(c, "Task created successfully", task)
}

func (h *TaskHandler) GetTask(c *fiber.Ctx) error {
	userID := c.Locals("id").(uuid.UUID)

	task, err := h.taskService.GetTasks(userID)
	if err != nil {
		return utils.NotFoundResponse(c, "Task not found")
	}

	return utils.SuccessResponse(c, "Task retrieved successfully", task)
}

func (h *TaskHandler) Update(c *fiber.Ctx) error {
	userID := c.Locals("id").(uuid.UUID)

	taskID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid task id")
	}

	var req dto.UpdateTaskRequest
	if err = c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err = utils.ValidateStruct(req); err != nil {
		validationErrors := utils.FormatValidationError(err)
		return utils.ValidationErrorResponse(c, validationErrors)
	}

	task, err := h.taskService.Update(taskID, userID, req)
	if err != nil {
		if err.Error() == "task not found" {
			return utils.NotFoundResponse(c, err.Error())
		}
		return utils.InternalServerErrorResponse(c, "Failed to update task")
	}

	return utils.SuccessResponse(c, "Task updated successfully", task)
}

func (h *TaskHandler) Delete(c *fiber.Ctx) error {
	userID := c.Locals("id").(uuid.UUID)

	taskID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid task id")
	}

	if err = h.taskService.Delete(taskID, userID); err != nil {
		if err.Error() == "task not found" {
			return utils.NotFoundResponse(c, err.Error())
		}

		return utils.InternalServerErrorResponse(c, "Failed to delete task")
	}

	return utils.NoContentResponse(c, "Task deleted successfully")
}

func (h *TaskHandler) BulkDelete(c *fiber.Ctx) error {
	userID := c.Locals("id").(uuid.UUID)

	var req dto.BulkDeleteRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(req); err != nil {
		validationErrors := utils.FormatValidationError(err)
		return utils.ValidationErrorResponse(c, validationErrors)
	}

	if err := h.taskService.BulkDelete(req.IDs, userID); err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to delete tasks")
	}

	return utils.NoContentResponse(c, "Tasks deleted successfully")
}
