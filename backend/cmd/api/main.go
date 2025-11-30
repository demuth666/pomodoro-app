package main

import (
	"backend/internal/handler"
	"backend/internal/repository"
	"backend/internal/routes/api"
	"backend/internal/service"
	"backend/pkg/database"
	"errors"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	db := database.ConnectDB()

	// Migration
	// err := db.AutoMigrate(&entity.User{}, &entity.Task{}, &entity.Session{})
	// if err != nil {
	// 	log.Fatal("Database migration failed:", err)
	// }

	//Repository
	userRepo := repository.NewUserRepository(db)
	taskRepo := repository.NewTaskRepository(db)
	sessionRepo := repository.NewSessionRepository(db)

	//Service
	authService := service.NewAuthService(userRepo)
	taskService := service.NewTaskService(taskRepo)
	sessionService := service.NewSessionService(sessionRepo)

	//Handler
	authHandler := handler.NewAuthHandler(authService)
	taskHandler := handler.NewTaskHandler(taskService)
	sessionHandler := handler.NewSessionHandler(sessionService)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	api.SetupRoutes(app, authHandler, taskHandler, sessionHandler)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	port := os.Getenv("PORT")

	log.Printf("Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
