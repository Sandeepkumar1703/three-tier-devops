.PHONY: install frontend-install backend-install docker-up docker-down test lint

install:
	npm install --workspaces

frontend-install:
	cd frontend && npm install

backend-install:
	cd backend && npm install

docker-up:
	docker compose up --build

docker-down:
	docker compose down -v

test:
	cd frontend && npm test -- --run
	cd backend && npm test -- --run

lint:
	cd frontend && npm run build
	cd backend && npm test -- --run
