.DEFAULT_GOAL := help
.PHONY: help install up up-prod down build migrate fresh seed deploy send db db-evolution thinker shell logs front-install front-build front-lint

# Comandos executados dentro do container PHP (app).
ARTISAN = docker compose exec app php artisan
COMPOSER = docker compose exec app composer

help: ## Lista os comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[33m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Instala dependências (backend + frontend) e prepara o ambiente
	@cp -n backend/.env.example backend/.env || true
	@cp -n .env.example .env || true
	docker compose build
	docker compose up -d
	$(COMPOSER) install
	$(ARTISAN) key:generate
	$(ARTISAN) migrate --seed
	npm install

up: ## Sobe o ambiente de desenvolvimento
	docker compose up -d

up-prod: ## Sobe o ambiente de produção (frontend já buildado em ./dist)
	docker compose -f docker-compose.prod.yml up -d --build

down: ## Derruba os containers
	docker compose down

build: ## Reconstrói as imagens dos containers
	docker compose build

migrate: ## Roda as migrations
	$(ARTISAN) migrate

fresh: ## Recria o banco e roda os seeders
	$(ARTISAN) migrate:fresh --seed

seed: ## Roda apenas os seeders
	$(ARTISAN) db:seed

front-install: ## Instala as dependências do frontend
	npm install

front-build: ## Gera o build de produção do frontend em ./dist
	npm run build

front-lint: ## Roda a verificação de tipos do frontend
	npm run lint

deploy: ## Atualiza o código e publica em produção (pull + build + migrate --force)
	git pull
	$(COMPOSER) install --no-dev --optimize-autoloader
	npm install
	npm run build
	docker compose -f docker-compose.prod.yml up -d --build
	docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
	docker compose -f docker-compose.prod.yml exec app php artisan config:cache
	docker compose -f docker-compose.prod.yml exec app php artisan route:cache

send: ## Aplica o lint e cria um commit (pede a mensagem) e faz push
	npm run lint
	$(COMPOSER) install --quiet
	@read -p "Mensagem do commit: " msg; \
	git add -A; \
	git commit -m "$$msg"; \
	git push --set-upstream origin $$(git rev-parse --abbrev-ref HEAD)

db: ## Abre o cliente MySQL do banco da aplicação
	docker compose exec mysql mysql -ufigurex -pfigurex figurex

db-evolution: ## Cria o banco 'evolution' no MySQL (rodar uma vez após make up)
	docker compose exec mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS evolution CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON evolution.* TO 'figurex'@'%'; FLUSH PRIVILEGES;"
	@echo "Banco 'evolution' criado e permissões concedidas."

thinker: ## Abre o Laravel Tinker
	$(ARTISAN) tinker

shell: ## Abre um shell no container PHP
	docker compose exec app bash

logs: ## Acompanha os logs dos containers
	docker compose logs -f
