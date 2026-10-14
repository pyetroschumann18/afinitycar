# Relatório de Identidade Visual & Design System — AfinityCar

> Documento oficial de marca, diretrizes visuais e tokens de interface  
> **Versão:** 2.0  
> **Plataforma:** AfinityCar Web Application (Next.js & Tailwind CSS)  
> **Status:** Ativo e em produção

## 1. Visão geral e posicionamento da marca

A AfinityCar posiciona-se no mercado automotivo como uma facilitadora de intermediação veicular humanizada, transparente e consultiva. Ao contrário de plataformas tradicionais agressivas e poluídas por anúncios, sua identidade visual transmite confiança, sobriedade contemporânea, esportividade elegante e proximidade.

### Fundamentos

- **Posicionamento:** intermediação automotiva, atendimento humanizado e consultoria sem pressão.
- **Estética visual:** dark luxury tech, contraste alto e confortável e linhas geométricas precisas.
- **Pilares de marca:** transparência em dados, agilidade de resposta e fluidez mobile-first.
- **Cores mestras:** Laranja Afinity (`#FF6B2C`), Preto Asfalto (`#0B0F11`) e Grafite Superfície (`#15191D`).

### 1.1 Proposta de valor e assinaturas verbais

- **Nome oficial:** AfinityCar
- **Subtítulo institucional:** Intermediação automotiva / AfinityCar Automóveis
- **Slogan principal:** “Sua busca por um carro começa aqui”
- **Assinatura de atendimento:** “Sua busca merece uma boa conversa.”
- **Abordagem central:** “Uma conversa simples para encontrar um veículo que combine com você.”
- **Origem e atendimento local:** Sorocaba, SP, com foco em atendimento ágil via WhatsApp.

## 2. Logotipo e identidade da marca

O logotipo da AfinityCar adota uma abordagem minimalista e contemporânea, sem caixas delimitadoras ou fundos fechados, permitindo respiro e sofisticação sobre superfícies escuras.

```text
AF  AFINITYCAR
    INTERMEDIAÇÃO AUTOMOTIVA
```

### 2.1 Componentes do logo

#### Monograma AF

- **Tipografia:** Plus Jakarta Sans, peso 900 (Black / Extra-Bold).
- **Kerning:** extremamente compacto (`letter-spacing: -0.06em`).
- **Cor:** Laranja Afinity (`#FF6B2C`).
- **Tratamento:** sem moldura ou fundo quadrado, sempre transparente.
- **Interação:** escala elástica no cursor (`scale(1.08)` no hover e `scale(0.95)` no active).

#### Wordmark AfinityCar

- **Afinity:** Branco Gelo (`#F2F4F4`), Plus Jakarta Sans, peso 800 e `letter-spacing: -0.045em`.
- **Car:** Laranja Afinity (`#FF6B2C`), peso 800.

#### Subtítulo institucional

- **Texto:** INTERMEDIAÇÃO AUTOMOTIVA
- **Tipografia:** Inter, peso 500, em caixa alta.
- **Tracking:** `letter-spacing: 0.13em`.
- **Tamanho:** `8px`.
- **Cor:** Cinza Neutro Claro (`#A8AFB4`).

## 3. Paleta cromática e tokens do sistema

A AfinityCar utiliza o paradigma visual **Dark Luxury Automotive**, inspirado no painel de instrumentos de veículos premium. O preto profundo e os tons de grafite proporcionam sofisticação e conforto visual prolongado, enquanto o laranja guia a atenção para as ações importantes.

### 3.1 Cores primárias e secundárias

| Token | Valor | Função no sistema |
| --- | --- | --- |
| `--orange` | `#FF6B2C` | Cor mestra de destaque, CTAs, badges ativos, foco e progresso |
| Orange Gradient | `#FF783E` → `#FF6B2C` | Gradiente de 135° aplicado aos botões primários |
| `--bg` | `#0B0F11` | Fundo principal — Preto Asfalto profundo |
| `--surface` | `#15191D` | Cards de veículos e contêiner do formulário |
| `--surface-2` | `#131719` | Cabeçalhos internos, inputs e subsuperfícies |
| `--line` | `#343B3E` | Linhas estruturais, divisórias e contornos sutis |
| `--text` | `#F2F4F4` | Texto principal e títulos de alto contraste |
| `--muted` | `#A3AAB0` | Textos auxiliares, legendas e descrições secundárias |
| `--green` | `#22C55E` | Sucesso, validação positiva e confirmação de lead |

### 3.2 Cores funcionais e de estado

#### Cards de escolha

- **Inativo:** fundo `#171C1F` e borda `#434B4F`.
- **Selecionado:** fundo `#2C201B`, contorno `#FF6B2C` e glow `rgba(255, 107, 44, 0.12)`.

#### Retorno de atendimento

- **Fundo:** `linear-gradient(135deg, rgba(255,107,44,.1) 0%, rgba(34,197,94,.08) 100%)`.
- **Borda:** `rgba(255, 107, 44, 0.35)`.

#### Acessibilidade e foco

- `:focus-visible` deve usar contorno sólido de `2px` em `#FF6B2C`, com `outline-offset: 4px`.

## 4. Tipografia e escala editorial

A AfinityCar combina duas famílias tipográficas: uma para impacto editorial e outra para legibilidade técnica.

### 4.1 Famílias tipográficas

#### Plus Jakarta Sans (`--font-jakarta`)

- Tipografia geométrica com curvas inspiradas no design automobilístico moderno.
- Usada em títulos (`h1`, `h2`, `h3`), valores monetários, anos dos veículos e logotipo.
- Tracking negativo entre `-0.025em` e `-0.08em` para uma aparência premium e esportiva.

#### Inter (`--font-inter`)

- Fonte funcional otimizada para telas digitais.
- Usada em botões, formulários, especificações técnicas e textos corridos.

### 4.2 Escala tipográfica fluida

| Elemento | Regra CSS | Desktop | Mobile | Peso e tracking |
| --- | --- | --- | --- | --- |
| Ano de fundo | `clamp(70px, 11vw, 150px)` | `150px` | `70px` | 800, `-0.08em` |
| Título do veículo | `clamp(32px, 5vw, 60px)` | `60px` | `32px` | 800, `-0.055em` |
| Pergunta do formulário | `clamp(24px, 3.2vw, 34px)` | `34px` | `24px` | 800, `-0.045em` |
| Título de seção | `clamp(24px, 3vw, 32px)` | `32px` | `24px` | 800, `-0.045em` |
| Preço em destaque | `clamp(29px, 3vw, 39px)` | `39px` | `29px` | 800, `-0.04em` |
| Texto de introdução | `clamp(16px, 2vw, 22px)` | `22px` | `16px` | 600, `-0.025em` |
| Corpo e descrição | `14px` | `14px` | `13px` | 400, `line-height: 1.7` |
| Legendas e metadados | `10px`–`11.5px` | `11px` | `10px` | 600–700 |

## 5. Componentes e padrões visuais

### 5.1 Card de veículo (`.vehicle-card`)

- **Foto:** proporção fixa de `16 / 10` para manter simetria entre os modelos.
- **Hover:** deslocamento vertical de `-4px`, borda de `#3A4245` para `#6B7579` e sombra `0 14px 28px rgba(0,0,0,0.3)`.
- **Imagem:** zoom suave em `scale(1.06)` com duração de `0.6s`.
- **Micro-CTA:** botão inferior laranja que registra o veículo selecionado e rola suavemente até o formulário.

### 5.2 Galeria horizontal (`.vehicle-gallery`)

- **Rolagem:** flex horizontal, `scroll-snap-type: x mandatory`, `overflow-x: auto` e `overflow-y: hidden`.
- **Controles:** círculos de `42px` no desktop e `36px` no mobile, com `backdrop-filter: blur(8px)` e fundo `rgba(16,23,25,.82)`.
- **Contador:** badge translúcido indicando posição atual, total e quantidade de fotos.
- **Miniaturas:** `80 × 60px`, com borda laranja de `2px` e glow quando ativas.

### 5.3 Formulário guiado (`.qualification-section`)

- **Estrutura:** navegação lateral com traço laranja de `22px` (`.tiny-line`) e numeração editorial (`01 / 02`).
- **Progresso:** trilho escuro e preenchimento laranja com `cubic-bezier(.16, 1, .3, 1)`.
- **Cards de escolha:** área de toque mínima de `65px` no desktop e `56px` no mobile, com indicador circular animado.
- **Pós-envio:** confirmação explícita de que o cliente receberá uma mensagem no WhatsApp.

## 6. Motion design e microinterações

### 6.1 Curvas padronizadas

| Uso | Curva | Comportamento |
| --- | --- | --- |
| Ações principais | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Resposta elástica, firme e ágil em hovers, botões e escalas |
| Aparição de etapas | `cubic-bezier(0.16, 1, 0.3, 1)` | Transição suave entre perguntas do formulário |
| Pop de seleção | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Rebote suave ao marcar opções |

### 6.2 Movimento acessível

O sistema deve implementar `@media (prefers-reduced-motion: reduce)`, desativando animações e tornando o scroll instantâneo quando o usuário solicita redução de movimento.

## 7. Tom de voz e copywriting

- **Consultivo e gentil:** evitar clichês como “Compre agora!” e escassez artificial. Preferir “Conte um pouco sobre o veículo que procura” e “Sua busca merece uma boa conversa”.
- **Transparente:** deixar claro que valores e especificações ilustrativos dependem de confirmação junto à equipe.
- **Seguro:** usar microcopy reconfortante, como “Seus dados estão seguros. Retornaremos com uma mensagem personalizada no seu WhatsApp.”
- **Sem fricção:** conduzir o cliente em passos curtos e diretos, sem questionários extensos em uma única página.

## 8. Regras para futuras extensões

Ao criar páginas, banners, anúncios, posts ou novos materiais da AfinityCar:

1. Manter o fundo predominantemente escuro, com `#0B0F11` e `#15191D`.
2. Usar o Laranja Afinity (`#FF6B2C`) como acento de ação, nunca como fundo da página inteira.
3. Aplicar o logotipo AF AfinityCar sem caixas ou contornos de fundo.
4. Usar Plus Jakarta Sans em peso Bold ou Black para títulos e números.
5. Usar Inter para textos explicativos, formulários e dados.
6. Manter as fotos dos veículos com iluminação limpa e enquadramento centralizado, valorizando a integridade do automóvel.
7. Preservar a abordagem consultiva, transparente e sem pressão em toda comunicação.
8. Garantir acessibilidade de foco, contraste, área de toque e movimento reduzido.
