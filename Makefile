VERSION := $$(cat package.json | grep version | sed 's/"/ /g' | awk {'print $$3'})
SVC=auth-api
PORT=5010
POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable
JWT_SECRET=123secret

clean c:
	@echo "[clean] cleaning..."
	@rm -rf dist || true
	@rm -rf proto-ts || true

typescript ts: clean
	# @echo "[copy] Copying protoc typescript generated files..."
	# @cp -r ../../proto/ts proto-ts || true
	@echo "[typescript] Transpiling code..."
	@node_modules/typescript/bin/tsc

run r: typescript
	@echo "[running] Running service..."
	@PORT=$(PORT) POSTGRES_DSN=$(POSTGRES_DSN) JWT_SECRET=$(JWT_SECRET) USERS_HOST=0.0.0.0 USERS_PORT=5020 npm start

compose co: typescript
	@echo "[docker-compose] Running docker-compose..."
	@docker-compose build
	@docker-compose up

stop s: 
	@echo "[docker-compose] Stopping docker-compose..."
	@docker-compose down

.PHONY: clean c typescript ts run r compose co stop s