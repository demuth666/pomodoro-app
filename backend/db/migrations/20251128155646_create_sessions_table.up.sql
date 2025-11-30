CREATE TABLE sessions (
                          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
                          type VARCHAR(20) NOT NULL,
                          status VARCHAR(20) NOT NULL DEFAULT 'completed',
                          duration INT NOT NULL,
                          started_at TIMESTAMP NOT NULL,
                          ended_at TIMESTAMP NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);
