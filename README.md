# Parana Store — ERP

Sistema de gestão de vendas, estoque, logística e marketing para e-commerce.

## Funcionalidades

- **Vendas** — registro de pedidos, histórico, etiquetas Correios (SuperFrete), NF-e (Tiny ERP)
- **Estoque** — controle de produtos, movimentações, sincronização com Tiny ERP
- **Logística** — controle de motoboys, rastreamento SEDEX
- **Marketing** — métricas de ads (Facebook Ads via Meta API), ROAS, CPV
- **Relatórios** — Resumo Mensal, Resumo de Vendas, Resumo Anual, exportação Excel
- **Pequenas Vendas** — vendas avulsas de acessórios
- **Custos Operacionais** — lançamento e controle de custos fixos

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend/Banco**: Supabase (PostgreSQL + Edge Functions + Auth)
- **Gráficos**: Recharts
- **Excel**: xlsx-js-style
- **Etiquetas**: SuperFrete API
- **NF-e**: Tiny ERP API

---

## Como configurar do zero

### 1. Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- (Opcional) Conta no [SuperFrete](https://superfrete.com) para etiquetas Correios
- (Opcional) Conta no [Tiny ERP](https://tiny.com.br) para NF-e

### 2. Clonar e instalar dependências

```bash
git clone https://github.com/SEU_USUARIO/triumph-store-template.git
cd triumph-store-template
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_SUPERFRETE_API_TOKEN=seu_token_aqui   # opcional
```

### 4. Criar o banco de dados no Supabase

No [Supabase Dashboard](https://supabase.com/dashboard):

1. Crie um novo projeto
2. Vá em **SQL Editor** e execute os arquivos de migration em ordem:

```bash
# Instale o Supabase CLI
npm install -g supabase

# Aplique todas as migrations
supabase db push
```

Ou execute manualmente cada arquivo `.sql` em `supabase/migrations/` no SQL Editor do Supabase, na ordem do nome do arquivo (do mais antigo para o mais novo).

### 5. Configurar Edge Functions (Supabase)

As Edge Functions ficam em `supabase/functions/`. Para fazer deploy:

```bash
supabase functions deploy
```

Configure as variáveis de ambiente das funções no Supabase Dashboard em **Edge Functions → Secrets**:

| Variável | Descrição |
|---|---|
| `TINY_API_TOKEN` | Token de API do Tiny ERP |
| `SUPABASE_URL` | URL do seu projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key do Supabase |
| `META_ACCESS_TOKEN` | Token de acesso da Meta (Facebook Ads) |
| `META_AD_ACCOUNT_ID` | ID da conta de anúncios do Facebook |

### 6. Configurar dados do remetente (etiquetas Correios)

Edite o arquivo `src/lib/superfrete.ts` e preencha o objeto `REMETENTE` com os dados da sua empresa:

```typescript
const REMETENTE = {
  name: "Sua Empresa LTDA",
  address: "Rua da Sua Empresa",
  number: "123",
  complement: "",
  district: "Centro",
  city: "Sua Cidade",
  state_abbr: "UF",
  postal_code: "00000000",
  document: "00000000000000", // CNPJ sem pontuação
};
```

### 7. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:5173`

### 8. Deploy na Vercel

1. Importe o repositório na [Vercel](https://vercel.com)
2. Em **Settings → Environment Variables**, adicione as mesmas variáveis do `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPERFRETE_API_TOKEN`
3. Deploy automático a cada push na branch `main`

---

## Estrutura do projeto

```
src/
├── components/       # Componentes reutilizáveis (Layout, Receipt, EditSale…)
├── lib/              # Utilitários (supabase, cardFees, superfrete, dateUtils…)
└── pages/            # Páginas da aplicação

supabase/
├── functions/        # Edge Functions (gerar-nfe, generate-shipment, ad-manager…)
└── migrations/       # Migrations SQL em ordem cronológica
```

---

## Licença

MIT
