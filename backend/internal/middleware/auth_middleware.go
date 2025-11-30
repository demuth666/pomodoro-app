package middleware

import (
	"backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Get("Authorization")
		if tokenString == "" {
			return utils.UnauthorizedResponse(c, "Missing authorization token")
		}

		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		userID, err := utils.ValidateToken(tokenString)
		if err != nil {
			return utils.UnauthorizedResponse(c, "Invalid or expired token")
		}

		c.Locals("id", userID)
		return c.Next()
	}
}
