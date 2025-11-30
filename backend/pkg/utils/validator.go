package utils

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

func ValidateStruct(s interface{}) error {
	return validate.Struct(s)
}

func FormatValidationError(err error) map[string]string {
	errors := make(map[string]string)

	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			field := strings.ToLower(e.Field())

			switch e.Tag() {
			case "required":
				errors[field] = fmt.Sprintf("%s is required", e.Field())
			case "email":
				errors[field] = "Invalid email format"
			case "min":
				errors[field] = fmt.Sprintf("%s must be at least %s characters", e.Field(), e.Param())
			case "max":
				errors[field] = fmt.Sprintf("%s must be at most %s characters", e.Field(), e.Param())
			case "uuid":
				errors[field] = "Invalid UUID format"
			default:
				errors[field] = fmt.Sprintf("%s is invalid", e.Field())
			}
		}
	}

	return errors
}
