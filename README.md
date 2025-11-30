# Pomodoro App

A full-stack Pomodoro application built with Go (Fiber) and React (Vite).

## Features

- **Timer**: Customizable Pomodoro timer with Focus, Short Break, and Long Break modes.
- **Task Management**: Create, edit, delete, and reorder tasks.
- **Session History**: Track your focus sessions and view history.
- **Statistics**: Visualize your productivity with charts and stats.
- **User System**: User registration, login, and profile management (update username/email).
- **Settings**: Customize timer durations and preferences.
- **Responsive Design**: Works on desktop and mobile.

## Tech Stack

### Backend
- **Language**: Go (Golang)
- **Framework**: Fiber v2
- **Database**: PostgreSQL
- **ORM**: GORM
- **Authentication**: JWT

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **Routing**: React Router DOM

## Prerequisites

- Docker & Docker Compose (Recommended)
- OR
- Go 1.21+
- Node.js 18+
- PostgreSQL 15+

## Getting Started

### Using Docker Compose (Easiest)

1.  Clone the repository.
2.  Run the application:
    ```bash
    docker-compose up --build
    ```
3.  Access the application:
    - Frontend: `http://localhost:80`
    - Backend API: `http://localhost:8080`

### Manual Setup

#### Database
1.  Ensure PostgreSQL is running.
2.  Create a database named `pomodoro_app`.
3.  Update database credentials in `backend/.env` (or set environment variables).

#### Backend
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    go mod download
    ```
3.  Run the server:
    ```bash
    go run cmd/api/main.go
    ```
    The server will start on `http://localhost:8080`.

#### Frontend
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The frontend will start on `http://localhost:5173`.

## API Documentation

The backend provides a RESTful API. Key endpoints include:

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Profile**: `/api/profile` (GET, PUT)
- **Tasks**: `/api/tasks` (CRUD)
- **Sessions**: `/api/sessions` (Create, Get)
- **Settings**: `/api/settings` (PUT)

## License

[MIT](LICENSE)
