# PlantãoTXT

Utilitário de plantão para médicos emergencistas: modelos de documentação clínica, formulários que montam a evolução a partir dos campos preenchidos, e calculadoras de beira de leito — tudo no navegador, pronto para copiar e colar no prontuário.

Roda inteiro no cliente. Sem servidor, sem banco, sem build, sem dependências.

## O que tem dentro

| Seção | O quê |
|-------|-------|
| 📋 Evolução | 6 formulários interativos: Admissão PS, Sala de Emergência (XABCDE), Evolução diária (SOAP), Evolução por sistemas (crítico), Atendimento PS / alta, Intercorrência |
| 🩺 Procedimentos | 20 descrições de procedimentos |
| 🧾 Orientações / Prescrições (Alta) | 8 modelos de alta |
| 🤖 Prompts de IA | 2 prompts reutilizáveis |
| 🧮 Ferramentas | DripCalc — infusão, bolus e fluidos |

Os formulários de evolução só colocam no texto o que foi preenchido, concordam em gênero com o campo Sexo, e calculam sozinhos driving pressure, relação P/F e TFGe (CKD-EPI 2021).

## Rodando localmente

Precisa ser servido por HTTP — os arquivos são módulos ES e não carregam via `file://`.

```bash
# a partir da raiz do projeto, com qualquer servidor estático
python -m http.server 8000
# ou
npx serve .
```

Depois abra `http://localhost:8000`.

## Publicando

Copie todos os arquivos para qualquer host estático. O `_headers` já traz os cabeçalhos de segurança para Netlify e Cloudflare Pages; em outros hosts, replique-os na configuração do servidor. A lista completa de arquivos que precisam ir junto está em [docs/BACKEND_OVERVIEW.md](docs/BACKEND_OVERVIEW.md).

## Privacidade

O que você digita fica no `sessionStorage` do navegador e some quando a aba é fechada. Nada é enviado para lugar nenhum — não existe servidor para onde enviar. Detalhes em [docs/AUTH_MATRIX.md](docs/AUTH_MATRIX.md).

> Ferramenta de apoio à documentação. Não substitui julgamento clínico: confira sempre doses, diluições e o texto gerado antes de usar.

## Documentação

| Documento | Para quê |
|-----------|----------|
| [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | Visão geral, arquitetura e fluxo principal |
| [CODE_INDEX.md](docs/CODE_INDEX.md) | Onde fica cada coisa, arquivo por arquivo |
| [FRONTEND_OVERVIEW.md](docs/FRONTEND_OVERVIEW.md) | Layout, componentes, estado e estilos |
| [API_CONTRACTS.md](docs/API_CONTRACTS.md) | Funções internas e contratos entre módulos |
| [DATABASE_OVERVIEW.md](docs/DATABASE_OVERVIEW.md) | Conteúdo: chaves de texto, modelos e catálogos |
| [DB_CHANGE_RULES.md](docs/DB_CHANGE_RULES.md) | Como adicionar ou alterar conteúdo com segurança |
| [ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) | Por que o código é assim |
| [BACKEND_OVERVIEW.md](docs/BACKEND_OVERVIEW.md) | Ausência de backend, persistência e deploy |
| [AUTH_MATRIX.md](docs/AUTH_MATRIX.md) | Acesso e tratamento dos dados digitados |

Quem for mexer no código — pessoa ou agente de IA — deve ler [CLAUDE.md](CLAUDE.md) antes.
