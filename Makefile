.DEFAULT_GOAL := help
.PHONY: help install install-prod up up-prod down down-prod build migrate fresh seed storage-link deploy send db db-evolution thinker shell logs front-install front-build front-lint

# Comandos executados dentro do container PHP (app).
ARTISAN = docker compose exec app php artisan
COMPOSER = docker compose exec app composer

# Ambiente de produção (docker-compose.prod.yml).
PROD = docker compose -f docker-compose.prod.yml
PROD_ARTISAN = $(PROD) exec app php artisan

# Build do frontend em um container descartável: o servidor não precisa ter Node instalado.
# A API é servida pelo mesmo Nginx, por isso o caminho relativo /api.
FRONT_BUILD = docker run --rm -v $(CURDIR):/app -w /app -e VITE_API_URL=/api node:20-alpine sh -c "npm install && npm run build"

# O PHP-FPM roda como www-data e precisa escrever em storage/ e bootstrap/cache.
PROD_PERMISSIONS = $(PROD) exec app chown -R www-data:www-data storage bootstrap/cache

help: ## Lista os comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[33m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Instala dependências (backend + frontend) e prepara o ambiente
	@cp -n backend/.env.example backend/.env || true
	@cp -n .env.example .env || true
	docker compose build
	docker compose up -d
	$(COMPOSER) install
	$(ARTISAN) key:generate
	$(ARTISAN) storage:link --force
	$(ARTISAN) migrate --seed
	@command -v npm >/dev/null && npm install || echo "npm não encontrado no host: o container node já instala as dependências do frontend."

install-prod: ## Prepara o ambiente de produção do zero (rodar uma vez no servidor)
	@cp -n backend/.env.example backend/.env || true
	@cp -n .env.example .env || true
	$(FRONT_BUILD)
	$(PROD) up -d --build
	$(PROD) exec app composer install --no-dev --optimize-autoloader
	@grep -q '^APP_KEY=base64' backend/.env || $(PROD_ARTISAN) key:generate --force
	$(PROD_ARTISAN) storage:link --force
	$(PROD_ARTISAN) migrate --force --seed
	$(PROD_ARTISAN) config:cache
	$(PROD_ARTISAN) route:cache
	$(PROD_PERMISSIONS)

up: ## Sobe o ambiente de desenvolvimento
	docker compose up -d

up-prod: ## Sobe o ambiente de produção (frontend já buildado em ./dist)
	$(PROD) up -d --build

down: ## Derruba os containers
	docker compose down

down-prod: ## Derruba os containers de produção
	$(PROD) down

build: ## Reconstrói as imagens dos containers
	docker compose build

migrate: ## Roda as migrations
	$(ARTISAN) migrate

fresh: ## Recria o banco e roda os seeders
	$(ARTISAN) migrate:fresh --seed

seed: ## Roda apenas os seeders
	$(ARTISAN) db:seed

storage-link: ## Cria o link public/storage (necessário para exibir as imagens)
	$(ARTISAN) storage:link --force

front-install: ## Instala as dependências do frontend
	npm install

front-build: ## Gera o build de produção do frontend em ./dist
	npm run build

front-lint: ## Roda a verificação de tipos do frontend
	npm run lint

deploy: ## Atualiza o código e publica em produção (pull + build + migrate --force)
	git pull
	$(FRONT_BUILD)
	$(PROD) up -d --build
	$(PROD) exec app composer install --no-dev --optimize-autoloader
	$(PROD_ARTISAN) storage:link --force
	$(PROD_ARTISAN) migrate --force
	$(PROD_ARTISAN) config:cache
	$(PROD_ARTISAN) route:cache
	$(PROD_PERMISSIONS)

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
