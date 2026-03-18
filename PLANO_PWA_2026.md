# Plano de Implementacao PWA 2026 - Projeto PA01 (Bluetooth ESP32)

## 1) Objetivo
Transformar o app atual em um PWA moderno, resiliente e instalavel, para que o cliente acesse o dispositivo PA01 e baixe relatorios do microSD interno via Bluetooth do ESP32, com compatibilidade ampla entre navegadores por arquitetura progressiva:
- Canal 1: Web Bluetooth (navegadores Chromium com suporte).
- Canal 2: Bridge local BLE para navegadores sem Web Bluetooth.
- Canal 3: Modo fallback por importacao manual de arquivos exportados.

## 2) Escopo do Produto
### Inclui
- App web modular com estado unificado.
- Manifest completo e Service Worker versionado.
- Fluxos de descoberta BLE, pareamento, listagem, download selecionado e download em lote.
- Persistencia local para fila, checkpoints e recuperacao.
- Camada de observabilidade e diagnostico.
- Testes unitarios, integracao e E2E cross-browser.

### Nao inclui (fase inicial)
- Sincronizacao com backend em nuvem.
- Multiusuario com autenticacao remota.
- Suporte a multiplos dispositivos em paralelo na mesma sessao.

## 3) Arquitetura de Referencia
### 3.1 Camadas
1. Interface e Experiencia
- Componentes de tela, status BLE, intensidade de sinal, progresso, log e erros acionaveis.

2. Aplicacao
- Casos de uso: descobrir, parear, conectar, listar, baixar 1, baixar lote, confirmar arquivo.
- Estado global: conexao, fila, progresso, eventos, capacidade do navegador.

3. Dominio
- Regras de protocolo PA01 sobre BLE GATT, parser de frames, retomada segura, timeouts e retries.

4. Infra de Dispositivo
- DeviceAdapterWebBluetooth.
- DeviceAdapterBridgeBle (WebSocket local para app companion).
- DeviceAdapterFileImport.

5. PWA Core
- Manifest + Service Worker + estrategia de cache + offline shell.

6. Persistencia local
- IndexedDB para estado, checkpoints e historico de coletas.
- LocalStorage apenas para preferencias leves.

### 3.2 Contrato de Adapter (conceitual)
- discover(): busca dispositivos PA01.
- connect(deviceId): abre canal e retorna capacidades.
- disconnect(): fecha canal com limpeza.
- send(command): envia comando.
- onData(callback): recebe bytes/eventos.
- isSupported(): verifica suporte no ambiente.

### 3.3 Diretrizes de Protocolo BLE
1. Definir Service UUID fixo do PA01.
2. Definir Characteristic UUID de comando (write).
3. Definir Characteristic UUID de dados/eventos (notify).
4. Definir framing com cabecalho, tamanho, payload e checksum.
5. Definir MTU alvo e estrategia de fragmentacao/reassemblagem.

## 4) Matriz de Compatibilidade
### Desktop
- Chrome e Edge: PWA completo + Web Bluetooth.
- Firefox: PWA completo + Bridge BLE local.
- Safari (macOS): PWA completo + Bridge BLE local.

### Mobile
- Android Chrome/Edge: PWA completo + Web Bluetooth (quando suportado pelo dispositivo).
- iOS Safari: PWA completo + Bridge BLE local (ou fallback manual quando nao houver companion).

## 5) Backlog por Epico
## Epico E1 - Refatoracao e Fundacao
### Historia E1-H1
Como operador, quero um app modular para evolucao segura.

Tarefas
1. Extrair CSS para arquivo dedicado.
2. Extrair JS para modulos por responsabilidade.
3. Criar camada de estado unico.
4. Isolar parser de protocolo PA01.
5. Padronizar erros e mensagens de UX.

Estimativa
- 5 a 8 pontos.

Criterios de aceite
- Fluxo atual preservado.
- Sem regressao de listar e baixar.
- Cobertura minima de testes unitarios para parser e estado.

## Epico E2 - PWA Core
### Historia E2-H1
Como usuario, quero instalar e abrir rapidamente o app mesmo offline.

Tarefas
1. Criar manifest completo (icone maskable, shortcuts, screenshots).
2. Implementar Service Worker com versionamento de cache.
3. Definir estrategia de cache por tipo de recurso.
4. Criar pagina de fallback offline.
5. Exibir estado online/offline na interface.

Estimativa
- 5 a 8 pontos.

Criterios de aceite
- Instalavel em desktop e mobile.
- App shell abre offline.
- Atualizacao de versao invalida cache antigo sem quebrar sessao.

## Epico E3 - Conectividade BLE e Compatibilidade
### Historia E3-H1
Como usuario em navegador com suporte, quero conectar por Web Bluetooth ao PA01.

Tarefas
1. Implementar DeviceAdapterWebBluetooth.
2. Implementar fluxo de discover/pareamento/conexao.
3. Padronizar eventos de conexao, leitura e erro.
4. Tratar desconexao inesperada e reconexao assistida.
5. Implementar controle de fragmentacao por MTU.

Estimativa
- 5 a 8 pontos.

Criterios de aceite
- Conectar/listar/baixar funciona em Chrome e Edge.
- Erros de permissao e Bluetooth desligado possuem orientacao clara.

### Historia E3-H2
Como usuario em Firefox/Safari, quero coletar via bridge BLE local.

Tarefas
1. Especificar protocolo local (mensagens e codigos de erro).
2. Implementar DeviceAdapterBridgeBle no front-end.
3. Criar aplicacao companion local (Node ou Rust) com BLE nativo.
4. Implementar pareamento com token curto e expiracao.
5. Criar instalador e guia de setup para cliente final.

Estimativa
- 8 a 13 pontos.

Criterios de aceite
- Fluxos de coleta equivalentes ao Web Bluetooth.
- Canal local autenticado.
- Processo de setup reproduzivel em Windows/macOS.

### Historia E3-H3
Como usuario sem Web Bluetooth/Bridge, quero alternativa minima funcional.

Tarefas
1. Criar modo importacao manual de arquivos.
2. Validar formato de arquivo e mensagens de erro.
3. Integrar ao mesmo pipeline de processamento.

Estimativa
- 3 a 5 pontos.

Criterios de aceite
- Usuario conclui coleta manual sem travar fluxo principal.

## Epico E4 - Resiliencia e Dados Locais
### Historia E4-H1
Como operador, quero retomar trabalho apos falha de conexao BLE.

Tarefas
1. Persistir fila e progresso no IndexedDB.
2. Checkpoint por arquivo.
3. Rotina de retomada na inicializacao.
4. Regras de retry com backoff para perda de link BLE.

Estimativa
- 5 a 8 pontos.

Criterios de aceite
- Interrupcao durante lote nao perde estado.
- Retomada ocorre com poucos passos manuais.

## Epico E5 - Seguranca e Compliance
### Historia E5-H1
Como responsavel tecnico, quero reduzir superficie de ataque.

Tarefas
1. HTTPS obrigatorio e headers de seguranca.
2. CSP restritiva sem inline script em producao.
3. Validacao de entrada e limites de payload.
4. Politica de telemetria com consentimento.
5. Assinatura do companion e verificacao de integridade.

Estimativa
- 5 a 8 pontos.

Criterios de aceite
- Auditoria de seguranca sem falhas criticas.
- Politicas documentadas e aplicadas em build.

## Epico E6 - Qualidade, Testes e Operacao
### Historia E6-H1
Como equipe, quero release previsivel e monitorado.

Tarefas
1. CI com lint, testes e build.
2. E2E cross-browser (Chromium, Firefox, WebKit).
3. Testes de conectividade (Bluetooth desligado, perda de link, timeout, retomada).
4. Rollout com canal beta e rollback.
5. Dashboard de erros por navegador/versao.

Estimativa
- 8 a 13 pontos.

Criterios de aceite
- Pipeline bloqueia regressao.
- Release com observabilidade e rollback validado.

## 6) Plano de Sprints (sugestao)
### Sprint 0 (1 semana)
- Definicao de protocolo BLE (UUIDs, framing, checksum, MTU).
- Setup de repositorio, linter, testes e CI base.
- Entregavel: documento tecnico BLE fechado e pipeline inicial.

### Sprint 1 (1 a 2 semanas)
- Epico E1 completo.
- Inicio de E2 (manifest + base SW).
- Entregavel: app modular sem regressao funcional.

### Sprint 2 (1 a 2 semanas)
- E2 completo.
- E3-H1 completo (Web Bluetooth adapter).
- Entregavel: PWA instalavel e fluxo completo em Chromium com PA01 BLE.

### Sprint 3 (2 semanas)
- E3-H2 em producao beta (Bridge BLE local).
- Inicio de E4.
- Entregavel: compatibilidade Firefox/Safari via companion.

### Sprint 4 (1 a 2 semanas)
- E4, E5 e E6 com foco em hardening e observabilidade.
- Entregavel: release candidate com testes cross-browser.

## 7) NFRs (Requisitos nao funcionais)
1. Disponibilidade local do app shell offline: alta.
2. Tempo de abertura (cache quente): abaixo de 2s em hardware medio.
3. Uso de memoria: sem crescimento continuo apos lotes longos.
4. Acessibilidade: foco visivel, teclado, labels e contraste.
5. Privacidade: coleta minima de dados, com consentimento explicito.
6. Confiabilidade BLE: taxa de sucesso de download por lote maior ou igual a 99% em ambiente controlado.

## 8) Definition of Done (DoD)
1. Historia implementada com testes automatizados.
2. Sem erro de lint e sem falha critica de seguranca.
3. Comportamento validado nos navegadores alvo da historia.
4. Logs e mensagens de erro com acao recomendada.
5. Documentacao de operacao atualizada.

## 9) Riscos e Mitigacoes
1. Risco: Web Bluetooth indisponivel no navegador/plataforma.
- Mitigacao: companion BLE local e fallback manual.

2. Risco: permissao Bluetooth bloqueada por politica corporativa.
- Mitigacao: guia de configuracao e modo alternativo.

3. Risco: instabilidade de sinal BLE durante download.
- Mitigacao: framing com checksum, retries e checkpoint por arquivo.

## 10) Proximas Acoes Imediatas
1. Aprovar especificacao de protocolo BLE (UUIDs e formato de frame).
2. Escolher stack de build (Vite + TypeScript recomendado).
3. Iniciar Sprint 0 com setup tecnico, testes base e simulador de protocolo PA01.
