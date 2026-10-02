# Central da Turma — Front-end

Next.js 15 + React 19 + Tailwind 4. Conversa com a API em Spring Boot (`central-da-turma-api`).

## Rodar no PC

1. Deixe a API rodando (`http://localhost:8080`).
2. Nesta pasta:

```bash
npm install
npm run dev
```

3. Abra **http://localhost:3000**.

Por padrão o front chama `http://localhost:8080/api`. Para apontar para outra API (ex: a do Railway), crie um arquivo `.env.local`:

```
NEXT_PUBLIC_API_URL=https://sua-api.up.railway.app/api
```

## Telas

| Rota | O que tem |
|---|---|
| `/login`, `/cadastro` | Entrar e criar conta |
| `/turmas` | Minhas turmas, entrar com código, criar turma. Aceita `?codigo=ABC234` para já vir preenchido (link de convite) |
| `/turmas/[id]` | Painel: resumo, atrasadas e próximos 7 dias |
| `/turmas/[id]/atividades` | Todas as atividades, filtros, criar e editar |
| `/turmas/[id]/turma` | Código de convite, disciplinas e membros |

## Deploy na Vercel

Importe o repositório na Vercel e configure `NEXT_PUBLIC_API_URL` com a URL da API.
Na API, coloque a URL da Vercel em `CORS_ORIGENS`.

## Estrutura

```
src/
├── app/            páginas (App Router)
├── components/     peças de tela (AtividadeItem, AtividadeForm, Modal, ...)
└── lib/
    ├── api.ts      todas as chamadas à API + tipos
    ├── auth.tsx    login/sessão (token JWT no localStorage)
    └── datas.ts    datas sempre no fuso de São Paulo
```

## Visual

Material escolar: papel frio, caneta azul nos botões, **marca-texto amarelo** no dia das atividades que vencem em até 2 dias e **sublinhado vermelho** nas atrasadas. Fonte: Instrument Sans (empacotada via `@fontsource`, funciona offline).
