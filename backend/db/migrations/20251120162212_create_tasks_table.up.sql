CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tasks (
                       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       task TEXT NOT NULL,
                       is_completed BOOLEAN DEFAULT FALSE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);