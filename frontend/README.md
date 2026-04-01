# Frontend - Assistência Técnica SaaS

Aplicação React + Vite integrada com a API existente do projeto.

## Pré-requisitos

- Node.js 18+
- Backend executando em `http://localhost:5000` (ou URL equivalente)

## Configuração

1. Copie `.env.example` para `.env`
2. Ajuste `VITE_API_URL` se necessário
3. Instale dependências:

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

## Build de produção

```bash
npm run build
```

## Módulos implementados

- Login e bootstrap de admin
- Dashboard operacional
- Clientes (CRUD + busca por nome/telefone/email)
- Equipamentos (CRUD + histórico por equipamento e serial)
- Ordens de serviço (criação, atualização de status, total, PDF, link público)
- Pagamentos
- Peças
- Funcionários
- Cargos
- Fotos (upload e registro manual)
- Notificações manuais
- Relatórios financeiros e operacionais
- Página pública de status com QR Code
