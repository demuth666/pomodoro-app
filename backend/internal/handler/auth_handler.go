package handler

import (
	"backend/internal/dto"
	"backend/internal/entity"
	"backend/internal/service"
	"backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req dto.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(req); err != nil {
		validationErrors := utils.FormatValidationError(err)
		return utils.ValidationErrorResponse(c, validationErrors)
	}

	result, err := h.authService.Register(req)
	if err != nil {
		if err.Error() == "email already registered" {
			return utils.BadRequestResponse(c, err.Error())
		}
		return utils.InternalServerErrorResponse(c, "Failed to register user")
	}

	return utils.CreatedResponse(c, "User registered successfully", result)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req dto.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(req); err != nil {
		validationErrors := utils.FormatValidationError(err)
		return utils.ValidationErrorResponse(c, validationErrors)
	}

	result, err := h.authService.Login(req)
	if err != nil {
		return utils.BadRequestResponse(c, err.Error())
	}

	return utils.SuccessResponse(c, "User logged in successfully", result)
}

func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("id").(uuid.UUID)

	user, err := h.authService.GetProfile(userID)
	if err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	return utils.SuccessResponse(c, "Profile retrieved successfully", user)
}

// PUT /api/auth/settings
func (h *AuthHandler) UpdateSettings(c *fiber.Ctx) error {
    userID := c.Locals("id").(uuid.UUID)

    var req entity.UserSettings
    if err := c.BodyParser(&req); err != nil {
        return utils.BadRequestResponse(c, "Invalid body")
    }

    err := h.authService.UpdateSettings(userID, req)

    if err != nil {
        return utils.InternalServerErrorResponse(c, "Gagal update setting")
    }

    return utils.SuccessResponse(c, "Setting updated", req)
}
