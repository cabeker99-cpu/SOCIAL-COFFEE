# Mapa Social Café Especial — ATER

Protótipo demonstrativo para até 50 registros fictícios, pensado para apoiar o desenho de um sistema de diagnóstico social e socioprodutivo das famílias da agroindústria de café especial.

## O que está incluído

- Formulário para preenchimento pelo produtor ou pela técnica.
- Campos de diagnóstico social, acesso a direitos, produção e comercialização.
- Sugestão de prioridade baseada em quatro critérios demonstrativos.
- Revisão técnica e atualização de status.
- Painel de indicadores e contagem de demandas por categoria.
- Exportação CSV.
- Armazenamento local no navegador.
- Manifesto PWA e service worker para cache da interface em hospedagem compatível.

## Limitações importantes

**Não usar dados reais.** Esta versão não tem autenticação, banco de dados remoto, sincronização entre dispositivos, controle de acesso nem segurança adequada para dados institucionais. O `localStorage` é específico do navegador e do dispositivo e pode ser apagado. Exportar CSV também cria uma cópia local.

A pontuação é demonstrativa e não constitui instrumento validado. Não pode determinar elegibilidade a benefícios, direitos ou serviços. A técnica deve revisar as prioridades, e situações de risco exigem avaliação independente da pontuação.

## Como testar no computador

1. Baixe e descompacte o projeto.
2. Abra `index.html` no navegador.
3. Acesse **Famílias e prioridades** e clique em **Carregar exemplos fictícios**.
4. Explore o painel, altere status e revisão, teste a busca e a exportação CSV.
5. Use **Novo diagnóstico** para adicionar dados inteiramente fictícios.

O modo offline do service worker normalmente só funciona depois de publicar em HTTPS ou executar por um servidor local compatível e carregar a aplicação online ao menos uma vez. Abrir `index.html` diretamente permite testar o formulário, mas não garante cache offline da página.

## Publicar no GitHub Pages

1. Crie um repositório chamado `mapa-social-cafe-ater`.
2. Envie os arquivos `index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `service-worker.js` e `README.md` para a raiz do repositório.
3. Em **Settings → Pages**, escolha **Deploy from a branch**, selecione `main` e `/ (root)`, e salve.
4. Aguarde a publicação e abra o endereço mostrado na página Pages.
5. Abra o site com conexão para que os arquivos possam ser armazenados em cache. Teste offline depois.

O site publicado pode ser acessível publicamente. Não inclua dados pessoais, credenciais, chaves secretas nem dados institucionais reais no repositório.

## Próxima etapa para um sistema real

Antes de coletar dados reais, obtenha autorização institucional e defina a ferramenta de armazenamento aprovada. A versão real precisa de autenticação, autorização por perfil, regras de acesso por registro, política de retenção, cópias de segurança, tratamento conforme a LGPD, sincronização segura e testes. Não basta conectar o formulário a uma base: as regras de segurança precisam ser configuradas e validadas.

## Estrutura

- `index.html` — telas e formulário.
- `style.css` — aparência responsiva.
- `app.js` — comportamento, cálculos e armazenamento local.
- `manifest.webmanifest` — configuração PWA.
- `service-worker.js` — cache da interface para uso offline após carregamento online.
