# ⭐ Figurex

Marketplace web para compra e venda de figurinhas colecionáveis. Conecta
colecionadores em um ambiente seguro, com gestão de pagamentos (Asaas) e
logística de envio (FreteNet).

## Stack

- **Backend:** Laravel 11 + PHP 8.4 + MySQL 8 + Sanctum (API REST JSON)
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router
- **Mensageria:** Evolution API v1.8.7 + MongoDB 6 (histórico de WhatsApp)
- **Infra:** Docker + Docker Compose + Nginx

## Perfis de acesso

| Perfil        | Descrição                                                            |
|---------------|----------------------------------------------------------------------|
| Visitante     | Acessa a landing page e o catálogo público; pode criar conta         |
| Participante  | Compra e vende figurinhas; tem painel completo de negociação         |
| Administrador | Modera usuários, anúncios e configura pagamento/frete                |

## Como rodar (primeira vez)

Pré-requisitos: Docker, Docker Compose e Node 20+.

```bash
make install
make db-evolution   # cria o banco auxiliar da Evolution no MySQL
```

`make install` copia os `.env`, sobe os containers, instala dependências,
gera a `APP_KEY`, roda as migrations com seeders e instala o frontend.
`make db-evolution` só precisa ser rodado uma vez por ambiente.

Em seguida, suba o ambiente:

```bash
make up
```

- Frontend: http://localhost:3000
- API: http://localhost:8000/api
- Evolution API: http://localhost:8080

Para conectar o WhatsApp, acesse `/admin/whatsapp` e escaneie o QR code.

## Usuários de demonstração

Todos com a senha `123456`:

| Perfil      | E-mail                  |
|-------------|-------------------------|
| Admin       | `admin@admin.com`       |
| Vendedor    | `vendedor@figurex.com`  |
| Comprador   | `comprador@figurex.com` |

A tela de login traz botões de **Acesso Rápido** que preenchem e autenticam
automaticamente com esses usuários.

## Comandos úteis

Veja todos com `make help`. Principais: `make up`, `make down`, `make fresh`,
`make migrate`, `make seed`, `make db`, `make db-evolution`, `make shell`,
`make send`, `make deploy`.

## Estrutura

```
backend/      Aplicação Laravel (API)
pages/        Páginas React
components/   Componentes (ui/ e layout/)
services/     Comunicação com a API
hooks/        Hooks e contextos (useAuth, useToast)
utils/        Utilidades (formatação, status)
types/        Tipos TypeScript
docker/       Dockerfiles e configs do Nginx
```

Mais detalhes de convenções e padrões em [CLAUDE.md](./CLAUDE.md).
