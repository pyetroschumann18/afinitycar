# AfinityCar

Experiência pública de busca e qualificação de interesse em veículos.

## O que está incluído

- Formulário condicional responsivo.
- Catálogo demonstrativo com quatro veículos.
- Páginas individuais com foto e informações de cada veículo.
- Navegação otimizada para desktop e dispositivos móveis.
- Envio de consultas via rota de servidor diretamente ao Supabase.

Os veículos, preços e demais informações comerciais são ilustrativos.

## Privacidade

O navegador envia os dados apenas para `/api/leads`. O servidor valida e chama diretamente `ingest_form_submission` no projeto Supabase `eelpnvdufxlwyotmxkhn`, com a chave privada `SUPABASE_SECRET_KEY` configurada exclusivamente no ambiente de servidor da Vercel. O projeto não usa n8n nem Google Sheets nesse fluxo. A chave nunca deve ser exposta no frontend ou no Git.

A função grava `form_submissions` e `leads` em uma operação, com novo lead no estágio exato `Novo` e idempotência por `submission_id`. A rota só mostra sucesso quando a resposta da função contém o mesmo `submission_id`, `lead_id` UUID e `status: processed`. Em caso de falha, os campos permanecem na tela e a tentativa seguinte usa o mesmo identificador. O aplicativo não inicia conversas de WhatsApp nem conecta as telas do CRM; o CRM demonstrativo pode continuar sem mostrar os novos leads.

Para ativar o fluxo em produção, cadastre a chave privada `sb_secret_...` do mesmo projeto em `SUPABASE_SECRET_KEY` na Vercel e faça uma nova implantação. Antes de anunciar o envio como operacional, confira uma gravação real em `form_submissions` e `leads`, inclusive a repetição do mesmo `submission_id`, e confirme `stage = Novo`. Não basta a mensagem de sucesso do formulário. A planilha anterior e seus dados não são apagados por esta alteração.

## Executar localmente

Requer Node.js 20.9 ou superior.

```bash
npm ci
npm run dev
```

Acesse `http://localhost:3200`.

## Verificações

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run test:e2e
npm run build
```
