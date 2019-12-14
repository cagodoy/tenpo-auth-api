#
# SO variables
#
# GITHUB_USER
# GITHUB_TOKEN
# JWT_SECRET
#

#
# Internal variables
#
VERSION := $$(cat package.json | grep version | sed 's/"/ /g' | awk {'print $$3'})
SVC=tenpo-auth-api
PORT=5010
POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable
JWT_SECRET=123secret
USERS_HOST=0.0.0.0
USERS_PORT=5020

clean c:
	@echo "[clean] cleaning..."
	@rm -rf dist || true
	@rm -rf proto-ts || true

typescript ts: clean
	@echo "[typescript] Transpiling code..."
	@node_modules/typescript/bin/tsc

run r: typescript
	@echo "[running] Running service..."
	@PORT=$(PORT) POSTGRES_DSN=$(POSTGRES_DSN) JWT_SECRET=$(JWT_SECRET) USERS_HOST=${USERS_HOST} USERS_PORT=$(USERS_PORT) npm start

add-migration am: 
	@echo "[add-migration] Adding migration"
	@goose -dir "./database/migrations" create $(name) sql

migrations m:
	@echo "[migrations] Runing migrations..."
	@cd database/migrations && goose postgres $(DSN) up

docker d:
	@echo "[docker] Building image..."
	@docker build -t $(SVC):$(VERSION) .
	
docker-login dl:
	@echo "[docker] Login to docker..."
	@docker login docker.pkg.github.com -u $(GITHUB_USER) -p $(GITHUB_TOKEN)

push p: linux docker docker-login
	@echo "[docker] pushing $(GITHUB_REGISTRY_URL)/$(SVC):$(VERSION)"
	@docker tag $(SVC):$(VERSION) $(GITHUB_REGISTRY_URL)/$(SVC):$(VERSION)
	@docker push $(GITHUB_REGISTRY_URL)/$(SVC):$(VERSION)

compose co: typescript
	@echo "[docker-compose] Running docker-compose..."
	@docker-compose build
	@docker-compose up

stop s: 
	@echo "[docker-compose] Stopping docker-compose..."
	@docker-compose down

.PHONY: clean c typescript ts run r compose co stop s