INSERT INTO users (name, email, password_hash)
VALUES ('System Admin', 'admin@example.com', '$2a$10$8fGfU8VtS0bLYD11w6j4uO1imlVYqH1XN.3s2QZ3x1kM5M5Ul/3n.')
ON CONFLICT (email) DO NOTHING;

INSERT INTO tasks (user_id, title, description)
SELECT id, 'Setup local environment', 'Verify the app runs using docker compose.'
FROM users
WHERE email = 'admin@example.com'
ON CONFLICT DO NOTHING;
