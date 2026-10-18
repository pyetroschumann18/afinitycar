# AfinityCar

Experiência pública de busca e qualificação de interesse em veículos.

## O que está incluído

- Formulário condicional responsivo.
- Catálogo demonstrativo com quatro veículos.
- Páginas individuais com foto e informações de cada veículo.
- Navegação otimizada para desktop e dispositivos móveis.
- Envio de consultas via rota de servidor para o n8n, com persistência esperada no Supabase.

Os veículos, preços e demais informações comerciais são ilustrativos.

## Privacidade

O navegador envia os dados apenas para `/api/leads`. O servidor valida e repassa ao n8n pela variável privada `N8N_LEAD_INTAKE_WEBHOOK_URL`; nenhuma credencial do Supabase fica neste projeto. A tela só mostra sucesso após resposta do n8n com `submission_id` correspondente, `lead_id` UUID e `status: processed`. Em caso de falha, os campos permanecem na tela e a tentativa seguinte usa o mesmo identificador.

O workflow do n8n deve chamar `ingest_form_submission` no projeto Supabase `eelpnvdufxlwyotmxkhn`, criar o lead no estágio exato `Novo` e responder **depois** da gravação com `{ "submission_id": "...", "lead_id": "...", "status": "processed" }`. Ele deve tratar `submission_id` de modo idempotente para que repetição não duplique o lead. O aplicativo não inicia conversas de WhatsApp nem conecta as telas do CRM; o CRM demonstrativo pode continuar sem mostrar os novos leads.

Antes de definir `N8N_LEAD_INTAKE_WEBHOOK_URL` no ambiente de produção, publique e verifique o webhook de produção no n8n e confira uma gravação real em `form_submissions` e `leads`. Não basta um HTTP 200/202. A planilha anterior e seus dados não são apagados por esta alteração.

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
