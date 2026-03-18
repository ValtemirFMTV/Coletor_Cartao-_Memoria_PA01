# PA01 Coleta de Arquivos – PWA

Sistema PWA moderno para coleta de relatorios do dispositivo PA01 via Bluetooth ESP32.

## 🚀 Para o Cliente (Modo de Uso)

### Instalação

1. **Abra este link** no seu navegador:  
   ```
   https://seu-usuario.github.io/pa01-coleta
   ```

2. **Instale o app** em seu dispositivo:
   - **Desktop (Chrome/Edge)**: Clique no ícone de instalar na barra de endereço.
   - **Android**: Menu → "Adicionar à Tela Inicial".
   - **iPhone/iPad (Safari)**: Compartilhar → "Adicionar à Tela de Início".

3. **Use o app** mesmo offline. A conexão com PA01 funciona melhor em:
   - ✅ Chrome/Edge (Windows, Mac, Android)
   - ⚠️ Safari (macOS) — requer app companion (bridge local)
   - ⚠️ Firefox — requer app companion (bridge local)

### Como Usar

1. Clique em **CONECTAR** para paresr com PA01.
2. Clique em **Listar Arquivos** para ver relatorios disponíveis.
3. Selecione um arquivo e clique em **Selecionado** ou clique em **Baixar Tudo**.
4. Os arquivos são baixados automaticamente para seu dispositivo.

### Requisitos

- Bluetooth ativado no dispositivo.
- PA01 ligado e em alcance Bluetooth (até 10m).
- Preferir Chrome/Edge para melhor compatibilidade.

---

## 👨‍💻 Para Desenvolvedores

### Estrutura do Projeto

```
pa01-coleta/
├── index.html                    # Entrada principal (PWA)
├── manifest.webmanifest         # Metadados do app
├── sw.js                         # Service Worker
├── offline.html                  # Página offline
├── js/
│   ├── app.js                   # App principal
│   ├── adapters/
│   │   ├── webBluetoothAdapter.js
│   │   └── webSerialAdapter.js
│   ├── config/
│   │   ├── ble.js
│   │   └── transport.js
│   └── protocol/
│       ├── bleFrame.js          # Parser BLE com frames
│       └── crc16.js             # CRC16 CCITT
├── icons/
│   ├── icon-192.svg
│   └── icon-512.svg
├── PLANO_PWA_2026.md           # Plano de arquitetura
├── ESPECIFICACAO_BLE_PA01.md   # Protocolo BLE
└── README.md                     # Este arquivo
```

### Stack Tecnológico

- **HTML5 + CSS3 + JavaScript (ES Modules)**
- **Web Bluetooth API** (primário)
- **Web Serial API** (fallback legado)
- **Service Worker** (offline + PWA)
- **SemVer**: v1.2.0

### Features Implementadas

✅ PWA installable (manifest + SW)  
✅ Suporte BLE (Web Bluetooth) com frame parser e CRC16  
✅ Fallback para Web Serial (legacy)  
✅ Modo offline com shell cache  
✅ Reconexão automática  
✅ Progresso em tempo real  
✅ Compatibilidade cross-browser  

### Desenvolvimento Local

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/pa01-coleta.git
cd pa01-coleta

# Servir localmente (Python 3)
python -m http.server 8000

# Abrir no navegador
http://localhost:8000
```

### Próximas Melhorias (Backog)

- [ ] Bridge BLE local (companion app para Firefox/Safari).
- [ ] IndexedDB para persistência de fila e checkpoints.
- [ ] Testes unitários e E2E.
- [ ] Compactação e versionamento automático do cache.
- [ ] Dashboard de diagnóstico de conectividade.

### Documentação Técnica

- [Plano PWA 2026](./PLANO_PWA_2026.md) — Roadmap completo.
- [Especificação BLE](./ESPECIFICACAO_BLE_PA01.md) — Protocolo PA01.

---

## 📋 Requisitos do Sistema

### Navegador
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+ (macOS)
- Android Chrome 90+

### Hardware
- Dispositivo com Bluetooth 4.0 ou superior.
- PA01 com ESP32 firmware atualizado.

### Conectividade
- Wi-Fi ou rede mobile (para instalar app).
- Bluetooth ativo (para comunicação com PA01).

---

## 🔒 Segurança

- HTTPS obrigatório (GitHub Pages garante).
- Pareamento Bluetooth nativo do SO.
- Sem dados sensíveis armazenados localmente além de cache necessário.
- Política de privacidade explícita no app.

---

## 📝 Versionamento

- **v1.2.0** (atual): PWA base + BLE framework.
- **v1.1.x**: Legacy Serial.
- Consulte [PLANO_PWA_2026.md](./PLANO_PWA_2026.md) para roadmap de sprints.

---

## 👥 Suporte

- Dúvidas sobre uso: verificar console do app (textarea azul).
- Relatório de bugs: incluir browser, versão e logs do console.

---

**Desenvolvido com ❤️ para PA01 | 2026**
