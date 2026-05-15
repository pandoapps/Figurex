# CLAUDE.md — Figurex

Guia de contexto para assistência de IA neste projeto. Leia antes de qualquer alteração.

## Regra nº 1: NÃO faça commits automáticos

Nunca rode `git commit`, `git push` ou `git add` por conta própria. O versionamento
é sempre disparado manualmente pelo desenvolvedor através do comando `make send`,
que pede a mensagem do commit. Você pode editar arquivos à vontade, mas o ato de
commitar/publicar é exclusivo do desenvolvedor.

## Padrão de idioma

- Todo o projeto é escrito em **português do Brasil**, com acentuação correta e
  obrigatória (anúncios, configurações, usuários, não "anuncios" ou "configuracoes").
- Mensagens de UI, comentários de código, mensagens de erro e de commit seguem o
  mesmo padrão. Identificadores de código (variáveis, funções, classes) ficam em
  inglês; textos visíveis ao usuário ficam em português.

## Stack de tecnologia

**Backend** (`backend/`)
- Laravel 11+ / PHP 8.4+
- MySQL 8
- Laravel Sanctum (autenticação via token Bearer)
- Arquitetura MVC + API REST JSON

**Frontend** (raiz do repositório)
- React 19 + TypeScript 5+
- Vite
- Tailwind CSS 4
- React Router

**Mensageria WhatsApp**
- Evolution API v1.8.7 (container `figurex_evolution`, porta 8080)
- MongoDB 6 (container `figurex_mongodb`) — banco de mensagens da Evolution
- Integração via `EvolutionController` + `evolutionService.ts`
- Funcionalidades: histórico de conversa por usuário, envio de mensagem, envio de teste

**Infraestrutura**
- Docker + Docker Compose
- Nginx como proxy reverso
- Makefile obrigatório para todos os comandos

## Estrutura de pastas

```
/
├── backend/        # Aplicação Laravel (API)
├── pages/          # Páginas React (rotas)
├── components/     # Componentes reutilizáveis (ui/ e layout/)
├── services/       # Camada de comunicação com a API (axios)
├── hooks/          # Hooks e contextos React (useAuth, useToast)
├── utils/          # Funções utilitárias (formatação, status)
├── types/          # Tipos TypeScript compartilhados
├── docker/         # Dockerfiles e configs do Nginx
├── CLAUDE.md
├── README.md
├── Makefile
├── docker-compose.yml
└── package.json
```

## Comandos Make

Nunca use `php artisan` diretamente — sempre passe pelo Makefile.

| Comando               | Descrição                                                      |
|-----------------------|----------------------------------------------------------------|
| `make install`        | Instala tudo e prepara o ambiente do zero                      |
| `make up`             | Sobe o ambiente de desenvolvimento                             |
| `make up-prod`        | Sobe o ambiente de produção                                    |
| `make down`           | Derruba os containers                                          |
| `make migrate`        | Roda as migrations                                             |
| `make fresh`          | Recria o banco e roda os seeders                               |
| `make seed`           | Roda apenas os seeders                                         |
| `make deploy`         | Pull + build + deploy em produção (migrations com `--force`)   |
| `make send`           | Aplica o lint, pede a mensagem e cria o commit + push          |
| `make db`             | Abre o cliente MySQL (banco `figurex`)                         |
| `make db-evolution`   | Cria o banco `evolution` no MySQL — rodar uma vez após install |
| `make thinker`        | Abre o Laravel Tinker                                          |
| `make shell`          | Abre um shell no container PHP                                 |

> **Nota sobre o WhatsApp:** após `make install` em um ambiente novo, rode `make db-evolution`
> para criar o banco auxiliar do MySQL (usado como fallback). O banco principal da Evolution
> é o MongoDB (`figurex_mongodb`). Após o primeiro `make up`, escaneie o QR code em
> `/admin/whatsapp` para conectar a instância.

## Convenções de código

**React**
- Apenas componentes funcionais, sempre com hooks.
- Props tipadas com `interface`.
- Chamadas à API ficam isoladas em `services/` — nunca use `fetch`/`axios`
  diretamente dentro de um componente.

**Laravel**
- Controllers retornam sempre JSON consistente.
- Validação via `FormRequest`.
- Transformação de resposta via API Resources.
- Regras de negócio vivem em `app/Services/` — controllers ficam enxutos.

**Banco de dados**
- Toda tabela tem `id()`, `timestamps()` e `softDeletes()`.
- Relacionamentos com `foreignId(...)->constrained()->onDelete('cascade')`.
- Seeders sempre idempotentes, usando `updateOrCreate()`.
- Usuário admin padrão: `admin@admin.com` / `123456`.

## Padrões de UI

- Identidade visual **glassmorphism** em todos os componentes (cards, painéis,
  modais, formulários). Paleta: azul escuro (`#0a1628`), azul médio (`#1a3a5c`),
  prata (`#b0bec5`), dourado (`#f5c518`) e branco.
- SPA: navegação sem recarregar a página, com transições suaves (`motion`).
- Animações sutis em hover de cards/botões e transições de tela em fade.

### Modais

- Fecham ao pressionar **ESC** e ao **clicar fora** do conteúdo (no overlay).
- Use sempre o componente `components/ui/GlassModal.tsx` ou o hook
  `hooks/useModalClose.ts` — não reimplemente esse comportamento.

### Toasts e tratamento de erro

- Feedback ao usuário é dado via toasts (`hooks/useToast.tsx`), nunca via `alert()`.
- Erros devem virar mensagens claras em português. Use `resolveErrorMessage()`
  de `services/api.ts` para traduzir falhas de API — nunca exiba algo como
  "Error 500" ou stack traces ao usuário.
- No backend, erros são padronizados em JSON pelo handler em `bootstrap/app.php`.
