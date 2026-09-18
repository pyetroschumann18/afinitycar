# AfinityCar

Projeto público de demonstração de uma experiência para busca e qualificação de interesse em veículos.

## O que está incluído

- Formulário condicional responsivo.
- Catálogo demonstrativo com quatro veículos.
- Páginas individuais com foto e informações de cada veículo.
- Navegação otimizada para desktop e dispositivos móveis.
- Fluxo demonstrativo sem coleta, transmissão ou armazenamento de dados.

Os veículos, preços e demais informações comerciais são ilustrativos.

## Privacidade

Esta versão não possui banco de dados, API de leads, integrações externas ou credenciais. Os valores digitados no formulário permanecem somente no estado temporário da página e desaparecem quando ela é recarregada.

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
