package handler

import (
	"backend/internal/dto"
	"backend/internal/service"
	"backend/pkg/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SessionHandler struct {
	sessionService *service.SessionService
}

func NewSessionHandler(sessionService *service.SessionService) *SessionHandler {
	return &SessionHandler{
		sessionService: sessionService,
	}
}

func (h *SessionHandler) Create(c *fiber.Ctx) error {
	userID := c.Locals("id").(uuid.UUID)

	var req dto.CreateSessionRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(req); err != nil {
		validationErrors := utils.FormatValidationError(err)
		return utils.ValidationErrorResponse(c, validationErrors)
	}

	session, err := h.sessionService.CreateSession(userID, req)
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to create task")
	}

	return utils.CreatedResponse(c, "Session created successfully", session)
}

func (h *SessionHandler) GetSessions(c *fiber.Ctx) error {
	userID := c.Locals("id").(uuid.UUID)
	period := c.Query("period", "day")

	now := time.Now()
	var startDate time.Time

	switch period {
	case "week":
		// Last 7 days
		startDate = now.AddDate(0, 0, -7)
	case "month":
		// Last 30 days
		startDate = now.AddDate(0, 0, -30)
	case "all":
		// All time (zero time)
		startDate = time.Time{}
	default:
		// Today (default)
		startDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	}

	session, err := h.sessionService.GetSessions(userID, startDate)
	if err != nil {
		return utils.NotFoundResponse(c, "Session not found")
	}

	return utils.SuccessResponse(c, "Session retrieved successfully", session)
}
