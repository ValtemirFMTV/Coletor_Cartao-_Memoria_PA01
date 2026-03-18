# Especificacao BLE PA01 (Sprint 0)

## 1) Objetivo
Definir um protocolo BLE robusto para coleta de relatorios do microSD interno do PA01 via ESP32, suportando transmissao confiavel de lista de arquivos e conteudo binario.

## 2) Perfil GATT
### Service principal
- Service UUID: 6e400001-b5a3-f393-e0a9-e50e24dcca9e

### Characteristics
1. Command Write (App -> PA01)
- UUID: 6e400002-b5a3-f393-e0a9-e50e24dcca9e
- Propriedade: Write / Write Without Response

2. Data Notify (PA01 -> App)
- UUID: 6e400003-b5a3-f393-e0a9-e50e24dcca9e
- Propriedade: Notify

Observacao:
- UUIDs acima seguem um padrao tipo UART BLE e podem ser alterados no firmware final.
- Congelar UUIDs antes de homologacao para evitar quebra de compatibilidade.

## 3) Modelo de Comandos de Alto Nivel
### Comandos da aplicacao
- LISTAR
- BAIXAR <nome_arquivo>
- CONFIRMAR <nome_arquivo>
- CANCELAR
- PING

### Eventos do dispositivo
- INICIO_LISTA
- PENDENTE;<nome>
- COLETADO;<nome>
- FIM_LISTA
- TAMANHO <bytes>
- INICIO_ARQUIVO
- FIM_ARQUIVO
- ACK <correlationId>
- ERRO <codigo>;<mensagem>

## 4) Framing Binario (nivel transporte)
Cada pacote BLE deve seguir o frame abaixo para suportar payload binario e validacao.

Byte layout:
- SOF: 1 byte (0xA5)
- VERSION: 1 byte (0x01)
- TYPE: 1 byte
- FLAGS: 1 byte
- CORRELATION_ID: 2 bytes (uint16, little endian)
- PAYLOAD_LEN: 2 bytes (uint16, little endian)
- PAYLOAD: N bytes
- CRC16: 2 bytes (uint16, little endian, polinomio 0x1021)

TYPE sugerido:
- 0x01: COMMAND_TEXT
- 0x02: EVENT_TEXT
- 0x03: FILE_CHUNK
- 0x04: ACK
- 0x05: ERROR
- 0x06: HEARTBEAT

FLAGS sugerido:
- bit0: INICIO_FRAGMENTO
- bit1: FIM_FRAGMENTO
- bit2: COMPRIMIDO
- bit3: RESERVADO

## 5) MTU e Fragmentacao
1. Negociar MTU maximo possivel no inicio da sessao.
2. Definir payload alvo por frame como MTU util menos cabecalho/CRC.
3. Arquivos devem ser quebrados em FILE_CHUNK com ordem garantida por sequence implícita no fluxo.
4. Reassemblagem no app deve validar CRC por frame e tamanho total esperado (TAMANHO).

## 6) Confiabilidade
1. Timeout de ACK por comando: 3 a 5 segundos.
2. Retry por comando: ate 3 tentativas com backoff linear.
3. Em erro de CRC ou timeout, reenviar ultimo bloco solicitado.
4. Checkpoint por arquivo no app para retomada de lote.

## 7) Cigos de erro (sugestao inicial)
- E100: Comando invalido
- E101: Arquivo nao encontrado
- E102: Falha de leitura no microSD
- E103: Sem espaco/buffer
- E104: CRC invalido
- E105: Sessao expirada
- E106: Dispositivo ocupado

## 8) Seguranca minima
1. Pareamento BLE no SO + whitelist de dispositivo PA01.
2. Token de sessao curta no primeiro handshake (challenge-response simples).
3. Expirar sessao apos inatividade.
4. Nao trafegar dados sensiveis em texto claro alem do necessario.

## 9) Criterios de aceite da Sprint 0
1. UUIDs e framing aprovados por firmware e front-end.
2. Simulador de frames consegue reproduzir lista e download de arquivo.
3. Documento fechado e versionado antes de iniciar E3-H1.

## 10) Pendencias para congelar
1. Confirmar UUID final de producao.
2. Confirmar algoritmo de CRC16 exato e vetor de teste.
3. Confirmar tamanho maximo de pacote por plataforma alvo (Android/iOS/Desktop).
