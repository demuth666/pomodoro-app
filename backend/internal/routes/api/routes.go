package api

import (
	"backend/internal/handler"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, authHandler *handler.AuthHandler, taskHandler *handler.TaskHandler, sessionHandler *handler.SessionHandler) {
	api := app.Group("/api")

	//Auth Routes
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)

	//Profile routes
	protected := api.Group("", middleware.AuthMiddleware())
	protected.Get("/profile", authHandler.GetProfile)
	protected.Put("/profile", authHandler.UpdateProfile)
	protected.Put("/settings", authHandler.UpdateSettings)

	//Task routes
	tasks := protected.Group("/tasks")
	tasks.Post("/", taskHandler.Create)
	tasks.Get("/", taskHandler.GetTask)
	tasks.Put("/:id", taskHandler.Update)
	tasks.Delete("/bulk-delete", taskHandler.BulkDelete)
	tasks.Delete("/:id", taskHandler.Delete)

	//Session routes
	sessions := protected.Group("/sessions")
	sessions.Post("/", sessionHandler.Create)
	sessions.Get("/", sessionHandler.GetSessions)
}
