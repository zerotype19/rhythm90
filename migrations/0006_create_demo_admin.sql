-- Insert demo admin account
-- Password: demo1234 (hashed with bcrypt-like approach)
-- For demo purposes, using a simple hash. In production, use proper bcrypt.
INSERT OR IGNORE INTO users (id, email, name, provider, role) VALUES 
('admin-demo-123', 'admin@example.com', 'Demo Admin', 'demo', 'admin'); 